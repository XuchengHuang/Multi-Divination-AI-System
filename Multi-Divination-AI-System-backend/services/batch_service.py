# services/batch_service.py - 批量操作业务逻辑（优化同步版本）
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from datetime import datetime

from models import User, Persona, Reading, ReadingSource, DivinationMethod, ReadingStatus
from schemas import BatchReadingCreate, BatchReadingResponse, PersonaResponse, ReadingResponse
from constants import TEST_USER_ID, SUCCESS_MESSAGES, ERROR_MESSAGES
from services.persona_service import PersonaService
from services.reading_service import ReadingService

class BatchService:
    def __init__(self, db: Session):
        self.db = db
        self.persona_service = PersonaService(db)
        self.reading_service = ReadingService(db)
    
    def create_batch_readings(self, batch_data: BatchReadingCreate) -> BatchReadingResponse:
        """批量创建占卜报告"""
        try:
            # 开始数据库事务
            # 1. 创建或获取Persona
            persona = self._create_or_get_persona(batch_data)
            
            # 2. 创建individual readings
            individual_readings = self._create_individual_readings(
                persona.id, batch_data
            )
            
            # 3. 创建integrated reading（如果有）
            integrated_reading = None
            if batch_data.integrated_report:
                integrated_reading = self._create_integrated_reading(
                    persona.id, batch_data, individual_readings
                )
            
            # 4.提交事务
            self.db.commit()
            
            # 5. 构建响应
            return BatchReadingResponse(
                persona=PersonaResponse.from_orm(persona),
                individual_readings=[ReadingResponse.from_orm(r) for r in individual_readings],
                integrated_reading=ReadingResponse.from_orm(integrated_reading) if integrated_reading else None,
                success=True,
                message=SUCCESS_MESSAGES["BATCH_SAVE_SUCCESS"]
            )
            
        except Exception as e:
            # 回滚事务
            self.db.rollback()
            raise Exception(f"批量保存失败: {str(e)}")
    
    def _create_or_get_persona(self, batch_data: BatchReadingCreate) -> Persona:
        """创建或获取Persona"""
        # 检查是否已存在同名的persona
        existing_persona = self.db.query(Persona).filter(
            Persona.user_id == TEST_USER_ID,
            Persona.display_name == batch_data.user_name
        ).first()
        
        if existing_persona:
            return existing_persona
        
        # 创建新的persona
        persona = Persona(
            user_id=TEST_USER_ID,
            display_name=batch_data.user_name,
            description=f"通过AI占卜系统创建的角色档案"
        )
        
        self.db.add(persona)
        self.db.flush()  # 获取ID但不提交
        
        return persona
    
    def _create_individual_readings(
        self, 
        persona_id: int, 
        batch_data: BatchReadingCreate
    ) -> List[Reading]:
        """创建individual readings"""
        readings = []
        
        for method_str, report_text in batch_data.individual_reports.items():
            # 验证占卜方法
            try:
                method = DivinationMethod(method_str)
            except ValueError:
                raise Exception(f"无效的占卜方法: {method_str}")
            
            # 提取该方法对应的输入数据
            method_input_data = self._extract_method_input_data(method, batch_data.input_data)
            
            # 计算单个报告的处理时间（平均分配）
            individual_processing_time = None
            if batch_data.total_processing_time:
                individual_processing_time = batch_data.total_processing_time // len(batch_data.individual_reports)
            
            # 创建reading
            reading = Reading(
                user_id=TEST_USER_ID,
                persona_id=persona_id,
                method=method,
                main_question=batch_data.primary_question,
                output_text=report_text,
                input_data=method_input_data,
                status=ReadingStatus.COMPLETED,
                ai_model_used=batch_data.ai_model_used,
                processing_time=individual_processing_time
            )
            
            self.db.add(reading)
            readings.append(reading)
        
        self.db.flush()  # 获取ID但不提交
        return readings
    
    def _create_integrated_reading(
        self, 
        persona_id: int, 
        batch_data: BatchReadingCreate,
        source_readings: List[Reading]
    ) -> Reading:
        """创建integrated reading"""
        # 创建综合报告
        integrated_reading = Reading(
            user_id=TEST_USER_ID,
            persona_id=persona_id,
            method=DivinationMethod.INTEGRATED,
            main_question=batch_data.primary_question,
            output_text=batch_data.integrated_report,
            input_data={
                "source_methods": [r.method.value for r in source_readings],
                "total_individual_reports": len(source_readings),
                "character_archetypes": batch_data.character_archetypes
            },
            status=ReadingStatus.COMPLETED,
            ai_model_used=batch_data.ai_model_used,
            processing_time=batch_data.total_processing_time
        )
        
        self.db.add(integrated_reading)
        self.db.flush()
        
        # 创建关联关系
        for source_reading in source_readings:
            reading_source = ReadingSource(
                integrated_reading_id=integrated_reading.id,
                source_reading_id=source_reading.id,
                weight=1
            )
            self.db.add(reading_source)
        
        return integrated_reading
    
    def _update_persona_archetypes(
        self, 
        persona_id: int, 
        character_archetypes: List[str]
    ) -> None:
        """更新persona的角色标签"""
        persona = self.db.query(Persona).filter(Persona.id == persona_id).first()
        if persona:
            persona.character_archetypes = character_archetypes
            persona.updated_at = datetime.utcnow()
    
    def _extract_method_input_data(
        self, 
        method: DivinationMethod, 
        all_input_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """根据占卜方法提取对应的输入数据"""
        method_data = {}
        
        if method == DivinationMethod.LIFEPATH:
            # 生命数字相关数据
            if "birth_date" in all_input_data:
                method_data["birth_date"] = all_input_data["birth_date"]
        
        elif method == DivinationMethod.PALMISTRY:
            # 手相相关数据
            palmistry_keys = ["palm_image_url", "hand_type", "palm_analysis"]
            for key in palmistry_keys:
                if key in all_input_data:
                    method_data[key] = all_input_data[key]
        
        elif method == DivinationMethod.ASTROLOGY:
            # 占星相关数据
            astrology_keys = ["birth_date", "birth_time", "birth_location", "birth_city", "birth_country"]
            for key in astrology_keys:
                if key in all_input_data:
                    method_data[key] = all_input_data[key]
        
        elif method == DivinationMethod.MBTI:
            # MBTI相关数据
            mbti_keys = ["mbti_type", "quiz_answers", "personality_traits"]
            for key in mbti_keys:
                if key in all_input_data:
                    method_data[key] = all_input_data[key]
        
        elif method == DivinationMethod.TAROT:
            # 塔罗相关数据
            tarot_keys = ["tarot_question", "selected_cards", "card_positions", "spread_type"]
            for key in tarot_keys:
                if key in all_input_data:
                    method_data[key] = all_input_data[key]
        
        # 添加通用数据
        method_data["created_via"] = "batch_creation"
        method_data["primary_question"] = all_input_data.get("primary_question")
        
        return method_data
    
    def get_user_batch_summary(self, user_id: int = TEST_USER_ID) -> Dict[str, Any]:
        """获取用户的批量操作汇总"""
        try:
            user = self.db.query(User).filter(User.id == user_id).first()
            if not user:
                raise Exception("用户不存在")
            
            # 统计信息
            total_personas = len(user.personas)
            total_readings = len(user.readings)
            
            # 按方法分组统计
            method_stats = {}
            for reading in user.readings:
                method = reading.method.value
                if method not in method_stats:
                    method_stats[method] = 0
                method_stats[method] += 1
            
            # 最近的占卜记录
            recent_readings = self.db.query(Reading).filter(
                Reading.user_id == user_id
            ).order_by(Reading.created_at.desc()).limit(5).all()
            
            # 收藏的报告数量
            favorite_count = self.db.query(Reading).filter(
                Reading.user_id == user_id,
                Reading.is_favorite == True
            ).count()
            
            return {
                "user_info": {
                    "id": user.id,
                    "username": user.username,
                    "created_at": user.created_at
                },
                "statistics": {
                    "total_personas": total_personas,
                    "total_readings": total_readings,
                    "favorite_readings": favorite_count,
                    "method_breakdown": method_stats
                },
                "recent_readings": [
                    {
                        "id": r.id,
                        "method": r.method.value,
                        "question": r.main_question[:50] + "..." if len(r.main_question) > 50 else r.main_question,
                        "created_at": r.created_at,
                        "is_favorite": r.is_favorite
                    }
                    for r in recent_readings
                ]
            }
            
        except Exception as e:
            raise Exception(f"获取汇总信息失败: {str(e)}")
    
    def get_persona_reading_count(self, persona_id: int) -> int:
        """获取某个persona的报告数量"""
        try:
            count = self.db.query(Reading).filter(
                Reading.persona_id == persona_id
            ).count()
            return count
        except Exception as e:
            raise Exception(f"获取报告数量失败: {str(e)}")
    
    def delete_batch_readings(self, persona_id: int) -> Dict[str, Any]:
        """删除某个persona的所有报告（批量删除）"""
        try:
            # 查询要删除的报告
            readings_to_delete = self.db.query(Reading).filter(
                Reading.persona_id == persona_id
            ).all()
            
            if not readings_to_delete:
                return {
                    "success": True,
                    "message": "没有找到需要删除的报告",
                    "deleted_count": 0
                }
            
            deleted_count = len(readings_to_delete)
            
            # 删除报告（关联的ReadingSource会通过cascade自动删除）
            for reading in readings_to_delete:
                self.db.delete(reading)
            
            self.db.commit()
            
            return {
                "success": True,
                "message": f"成功删除 {deleted_count} 个报告",
                "deleted_count": deleted_count
            }
            
        except Exception as e:
            self.db.rollback()
            raise Exception(f"批量删除失败: {str(e)}")