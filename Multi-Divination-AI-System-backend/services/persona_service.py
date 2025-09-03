# services/persona_service.py - Persona业务逻辑
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from models import Persona, User
from schemas import PersonaCreate, PersonaUpdate, PersonaResponse
from constants import TEST_USER_ID, SUCCESS_MESSAGES, ERROR_MESSAGES

class PersonaService:
    def __init__(self, db: Session):
        self.db = db
    
    def create_persona(self, persona_data: PersonaCreate, user_id: int = TEST_USER_ID) -> Persona:
        """创建新的Persona，如果同名则返回现有的"""
        try:
            # 检查是否已存在同名persona
            existing_persona = self.db.query(Persona).filter(
                Persona.user_id == user_id,
                Persona.display_name == persona_data.display_name
            ).first()
            
            if existing_persona:
                # 返回现有的persona，不创建重复的
                print(f"ℹ️  使用现有角色档案: {persona_data.display_name} (ID: {existing_persona.id})")
                return existing_persona
            
            # 创建新persona
            persona = Persona(
                user_id=user_id,
                display_name=persona_data.display_name,
                description=persona_data.description or f"角色档案: {persona_data.display_name}"
            )
            
            self.db.add(persona)
            self.db.commit()
            self.db.refresh(persona)
            
            print(f"✅ 创建新角色档案: {persona_data.display_name} (ID: {persona.id})")
            return persona
            
        except Exception as e:
            self.db.rollback()
            raise Exception(f"处理角色档案失败: {str(e)}")
    
    def get_persona_by_id(self, persona_id: int, user_id: int = TEST_USER_ID) -> Optional[Persona]:
        """根据ID获取Persona"""
        return self.db.query(Persona).filter(
            Persona.id == persona_id,
            Persona.user_id == user_id
        ).first()
    
    def get_personas_by_user(self, user_id: int = TEST_USER_ID) -> List[Persona]:
        """获取用户的所有Persona"""
        return self.db.query(Persona).filter(
            Persona.user_id == user_id
        ).order_by(Persona.created_at.desc()).all()
    
    def find_persona_by_name(self, name: str, user_id: int = TEST_USER_ID) -> Optional[Persona]:
        """根据姓名查找Persona"""
        return self.db.query(Persona).filter(
            Persona.user_id == user_id,
            Persona.display_name == name.strip()
        ).first()
    
    def find_personas_by_name_fuzzy(self, name: str, user_id: int = TEST_USER_ID) -> List[Persona]:
        """根据姓名模糊查找Personas"""
        search_pattern = f"%{name.strip()}%"
        return self.db.query(Persona).filter(
            Persona.user_id == user_id,
            Persona.display_name.ilike(search_pattern)
        ).order_by(Persona.created_at.desc()).all()
    
    def update_persona(self, persona_id: int, persona_data: PersonaUpdate, user_id: int = TEST_USER_ID) -> Persona:
        """更新Persona"""
        try:
            persona = self.get_persona_by_id(persona_id, user_id)
            if not persona:
                raise Exception(ERROR_MESSAGES["PERSONA_NOT_FOUND"])
            
            # 更新字段
            update_data = persona_data.dict(exclude_unset=True)
            for field, value in update_data.items():
                if hasattr(persona, field):
                    setattr(persona, field, value)
            
            persona.updated_at = datetime.utcnow()
            
            self.db.commit()
            self.db.refresh(persona)
            
            return persona
            
        except Exception as e:
            self.db.rollback()
            raise Exception(f"更新角色档案失败: {str(e)}")
    
    def delete_persona(self, persona_id: int, user_id: int = TEST_USER_ID) -> bool:
        """删除Persona"""
        try:
            persona = self.get_persona_by_id(persona_id, user_id)
            if not persona:
                raise Exception(ERROR_MESSAGES["PERSONA_NOT_FOUND"])
            
            # 检查是否有关联的reading
            if persona.readings:
                raise Exception("无法删除有占卜记录的角色档案，请先删除相关占卜记录")
            
            self.db.delete(persona)
            self.db.commit()
            
            return True
            
        except Exception as e:
            self.db.rollback()
            raise Exception(f"删除角色档案失败: {str(e)}")
    
    def get_persona_with_stats(self, persona_id: int, user_id: int = TEST_USER_ID) -> dict:
        """获取带统计信息的Persona"""
        persona = self.get_persona_by_id(persona_id, user_id)
        if not persona:
            raise Exception(ERROR_MESSAGES["PERSONA_NOT_FOUND"])
        
        # 统计信息
        total_readings = len(persona.readings)
        completed_readings = len([r for r in persona.readings if r.status.value == "completed"])
        favorite_readings = len([r for r in persona.readings if r.is_favorite])
        
        # 按方法分组
        method_stats = {}
        for reading in persona.readings:
            method = reading.method.value
            if method not in method_stats:
                method_stats[method] = 0
            method_stats[method] += 1
        
        return {
            "persona": PersonaResponse.from_orm(persona),
            "statistics": {
                "total_readings": total_readings,
                "completed_readings": completed_readings,
                "favorite_readings": favorite_readings,
                "method_breakdown": method_stats
            }
        }