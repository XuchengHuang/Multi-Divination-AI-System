# schemas.py - 清晰版本，按功能分组
from pydantic import BaseModel, Field, validator
from typing import List, Dict, Any, Optional
from datetime import datetime
from enum import Enum
import re

# ===== 枚举类型 =====
class DivinationMethodEnum(str, Enum):
    LIFEPATH = "LifePathNumber"
    PALMISTRY = "Palmistry"
    ASTROLOGY = "Astrology"
    MBTI = "MBTI"
    TAROT = "Tarot"
    INTEGRATED = "Integrated"

class ReadingStatusEnum(str, Enum):
    COMPLETED = "completed"
    SAVED = "saved"

# ===== 用户相关 =====
class GuestUserCreate(BaseModel):
    """创建游客用户"""
    username: Optional[str] = Field(None, min_length=2, max_length=50)

class UserResponse(BaseModel):
    """用户信息响应"""
    id: int
    username: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

# ===== Persona相关 =====
class PersonaCreate(BaseModel):
    """创建角色档案"""
    display_name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    
    @validator('display_name')
    def validate_display_name(cls, v):
        if not v or not v.strip():
            raise ValueError('显示名称不能为空')
        
        # 检查是否全是符号/特殊字符
        if re.match(r'^[^\w\s]+$', v.strip()):
            raise ValueError('显示名称不能全是符号，请输入有效的姓名')
        
        # 检查是否包含有意义的字符（字母、数字或中文）
        if not re.search(r'[\w\u4e00-\u9fff]', v):
            raise ValueError('显示名称必须包含有效字符（字母、数字或中文）')
        
        return v.strip()
    
    @validator('description')
    def validate_description(cls, v):
        if v is not None:
            v = v.strip()
            if v and re.match(r'^[^\w\s]+$', v):
                raise ValueError('描述不能全是符号，请输入有意义的内容')
        return v

class PersonaUpdate(BaseModel):
    """更新角色档案"""
    display_name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    character_archetypes: Optional[List[str]] = None
    
    @validator('display_name')
    def validate_display_name(cls, v):
        if v is not None:
            if not v.strip():
                raise ValueError('显示名称不能为空')
            
            if re.match(r'^[^\w\s]+$', v.strip()):
                raise ValueError('显示名称不能全是符号，请输入有效的姓名')
            
            if not re.search(r'[\w\u4e00-\u9fff]', v):
                raise ValueError('显示名称必须包含有效字符（字母、数字或中文）')
            
            return v.strip()
        return v
    
    @validator('description')
    def validate_description(cls, v):
        if v is not None:
            v = v.strip()
            if v and re.match(r'^[^\w\s]+$', v):
                raise ValueError('描述不能全是符号，请输入有意义的内容')
        return v
    
    @validator('character_archetypes')
    def validate_character_archetypes(cls, v):
        if v is not None:
            valid_archetypes = []
            for archetype in v:
                if archetype and archetype.strip():
                    if re.match(r'^[^\w\s]+$', archetype.strip()):
                        raise ValueError('角色原型不能全是符号')
                    valid_archetypes.append(archetype.strip())
            return valid_archetypes
        return v

class PersonaResponse(BaseModel):
    """角色档案响应"""
    id: int
    display_name: str
    description: Optional[str]
    character_archetypes: Optional[List[str]]
    created_at: datetime
    reading_count: int = 0
    
    class Config:
        from_attributes = True

# ===== Reading相关 =====
class SingleReadingCreate(BaseModel):
    """创建单个占卜报告"""
    persona_id: Optional[int] = None
    method: DivinationMethodEnum
    main_question: str = Field(..., min_length=5, max_length=1000)
    output_text: str = Field(..., min_length=10)
    input_data: Optional[Dict[str, Any]] = None
    ai_model_used: str = "gemini-pro"
    processing_time: Optional[int] = None
    confidence_score: Optional[int] = Field(None, ge=1, le=100)

class ReadingUpdate(BaseModel):
    """更新占卜报告"""
    is_favorite: Optional[bool] = None
    user_rating: Optional[int] = Field(None, ge=1, le=5)
    user_feedback: Optional[str] = Field(None, max_length=1000)

class ReadingResponse(BaseModel):
    """占卜报告响应"""
    id: int
    persona_id: Optional[int]
    method: DivinationMethodEnum
    main_question: str
    output_text: str
    input_data: Optional[Dict[str, Any]]
    status: ReadingStatusEnum
    ai_model_used: Optional[str]
    processing_time: Optional[int]
    is_favorite: bool
    user_rating: Optional[int]
    created_at: datetime
    
    class Config:
        from_attributes = True

class ReadingListItem(BaseModel):
    """报告列表项"""
    id: int
    method: DivinationMethodEnum
    main_question: str
    preview_text: str = Field(..., max_length=200)
    is_favorite: bool
    user_rating: Optional[int]
    created_at: datetime
    persona_name: Optional[str]
    
    class Config:
        from_attributes = True

# ===== 综合报告相关 =====
class IntegratedReadingCreate(BaseModel):
    """创建综合报告"""
    persona_id: Optional[int] = None
    main_question: str = Field(..., min_length=5, max_length=1000)
    source_reading_ids: List[int] = Field(..., min_items=2, max_items=5)
    output_text: str = Field(..., min_length=10)
    character_archetypes: Optional[List[str]] = None
    ai_model_used: str = "gemini-pro"

# ===== 批量操作相关 =====
class BatchReadingCreate(BaseModel):
    """批量创建报告（前端完成AI生成后一次性发送）"""
    user_name: str = Field(..., min_length=1, max_length=255)
    primary_question: str = Field(..., min_length=5, max_length=1000)
    selected_methods: List[DivinationMethodEnum] = Field(..., min_items=1, max_items=5)
    input_data: Dict[str, Any] = {}
    individual_reports: Dict[str, str] = Field(..., min_items=1)
    integrated_report: Optional[str] = None
    character_archetypes: Optional[List[str]] = None
    ai_model_used: str = "gemini-pro"
    total_processing_time: Optional[int] = None

class BatchReadingResponse(BaseModel):
    """批量创建响应"""
    persona: PersonaResponse
    individual_readings: List[ReadingResponse]
    integrated_reading: Optional[ReadingResponse]
    success: bool = True
    message: str = "所有报告已保存成功"

# ===== 通用响应 =====
class MessageResponse(BaseModel):
    """通用消息响应"""
    message: str
    success: bool = True
    data: Optional[Any] = None

class ErrorResponse(BaseModel):
    """错误响应"""
    error: str
    detail: Optional[str] = None
    success: bool = False