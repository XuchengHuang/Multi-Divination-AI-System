# services/reading_service.py - Reading业务逻辑
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime

from models import Reading, Persona, DivinationMethod, ReadingStatus
from schemas import SingleReadingCreate, ReadingUpdate, ReadingResponse
from constants import TEST_USER_ID, SUCCESS_MESSAGES, ERROR_MESSAGES

class ReadingService:
    def __init__(self, db: Session):
        self.db = db
    
    def create_reading(self, reading_data: SingleReadingCreate, user_id: int = TEST_USER_ID) -> Reading:
        """创建单个占卜报告"""
        try:
            # 验证persona（如果提供）
            if reading_data.persona_id:
                persona = self.db.query(Persona).filter(
                    Persona.id == reading_data.persona_id,
                    Persona.user_id == user_id
                ).first()
                if not persona:
                    raise Exception("指定的角色档案不存在")
            
            # 创建reading
            reading = Reading(
                user_id=user_id,
                persona_id=reading_data.persona_id,
                method=reading_data.method,
                main_question=reading_data.main_question,
                output_text=reading_data.output_text,
                input_data=reading_data.input_data,
                status=ReadingStatus.COMPLETED,
                ai_model_used=reading_data.ai_model_used,
                processing_time=reading_data.processing_time,
                confidence_score=reading_data.confidence_score
            )
            
            self.db.add(reading)
            self.db.commit()
            self.db.refresh(reading)
            
            return reading
            
        except Exception as e:
            self.db.rollback()
            raise Exception(f"创建占卜报告失败: {str(e)}")
    
    def get_reading_by_id(self, reading_id: int, user_id: int = TEST_USER_ID) -> Optional[Reading]:
        """根据ID获取Reading"""
        return self.db.query(Reading).filter(
            Reading.id == reading_id,
            Reading.user_id == user_id
        ).first()
    
    def get_readings_by_user(
        self, 
        user_id: int = TEST_USER_ID,
        persona_id: Optional[int] = None,
        method: Optional[DivinationMethod] = None,
        limit: int = 20,
        offset: int = 0
    ) -> List[Reading]:
        """获取用户的占卜报告列表"""
        query = self.db.query(Reading).filter(Reading.user_id == user_id)
        
        if persona_id:
            query = query.filter(Reading.persona_id == persona_id)
        
        if method:
            query = query.filter(Reading.method == method)
        
        return query.order_by(Reading.created_at.desc()).offset(offset).limit(limit).all()
    
    def update_reading(self, reading_id: int, reading_data: ReadingUpdate, user_id: int = TEST_USER_ID) -> Reading:
        """更新占卜报告"""
        try:
            reading = self.get_reading_by_id(reading_id, user_id)
            if not reading:
                raise Exception(ERROR_MESSAGES["READING_NOT_FOUND"])
            
            # 更新字段
            update_data = reading_data.dict(exclude_unset=True)
            for field, value in update_data.items():
                if hasattr(reading, field):
                    setattr(reading, field, value)
            
            reading.updated_at = datetime.utcnow()
            
            self.db.commit()
            self.db.refresh(reading)
            
            return reading
            
        except Exception as e:
            self.db.rollback()
            raise Exception(f"更新占卜报告失败: {str(e)}")
    
    def delete_reading(self, reading_id: int, user_id: int = TEST_USER_ID) -> bool:
        """删除占卜报告"""
        try:
            reading = self.get_reading_by_id(reading_id, user_id)
            if not reading:
                raise Exception(ERROR_MESSAGES["READING_NOT_FOUND"])
            
            self.db.delete(reading)
            self.db.commit()
            
            return True
            
        except Exception as e:
            self.db.rollback()
            raise Exception(f"删除占卜报告失败: {str(e)}")
    
    def get_reading_with_sources(self, reading_id: int, user_id: int = TEST_USER_ID) -> Dict[str, Any]:
        """获取带关联信息的Reading"""
        reading = self.get_reading_by_id(reading_id, user_id)
        if not reading:
            raise Exception(ERROR_MESSAGES["READING_NOT_FOUND"])
        
        result = {
            "reading": ReadingResponse.from_orm(reading),
            "source_readings": [],
            "integrated_readings": []
        }
        
        # 如果是综合报告，获取源报告
        if reading.method == DivinationMethod.INTEGRATED:
            source_readings = []
            for source_relation in reading.source_readings:
                source_reading = source_relation.source_reading
                source_readings.append({
                    "id": source_reading.id,
                    "method": source_reading.method.value,
                    "question": source_reading.main_question,
                    "weight": source_relation.weight
                })
            result["source_readings"] = source_readings
        
        # 如果是individual报告，获取相关的综合报告
        else:
            integrated_readings = []
            for integrated_relation in reading.integrated_readings:
                integrated_reading = integrated_relation.integrated_reading
                integrated_readings.append({
                    "id": integrated_reading.id,
                    "question": integrated_reading.main_question,
                    "created_at": integrated_reading.created_at
                })
            result["integrated_readings"] = integrated_readings
        
        return result