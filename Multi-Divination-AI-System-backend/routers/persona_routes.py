# routers/persona_routes.py - 角色档案路由
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any

from database import get_db
from services.persona_service import PersonaService
from schemas import PersonaCreate, PersonaUpdate, PersonaResponse, MessageResponse
from constants import ERROR_MESSAGES, SUCCESS_MESSAGES

# 创建路由器
router = APIRouter(
    prefix="/personas",
    tags=["personas"],
    responses={404: {"description": "Not found"}}
)

@router.post("/", response_model=PersonaResponse)
def create_persona(
    persona_data: PersonaCreate,
    db: Session = Depends(get_db)
):
    """
    创建新的角色档案
    
    - **persona_data**: 包含角色档案的基本信息
    - 如果同名角色档案已存在，返回现有的档案
    - 否则创建新的角色档案
    """
    try:
        persona_service = PersonaService(db)
        persona = persona_service.create_persona(persona_data)
        
        return PersonaResponse.from_orm(persona)
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"数据验证失败: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"创建角色档案失败: {str(e)}"
        )

@router.get("/", response_model=List[PersonaResponse])
def get_user_personas(
    db: Session = Depends(get_db)
):
    """
    获取用户的所有角色档案
    
    - 返回按创建时间倒序排列的角色档案列表
    """
    try:
        persona_service = PersonaService(db)
        personas = persona_service.get_personas_by_user()
        
        return [PersonaResponse.from_orm(persona) for persona in personas]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取角色档案列表失败: {str(e)}"
        )

@router.get("/search", response_model=List[PersonaResponse])
def search_personas(
    name: str = Query(..., description="要搜索的角色名称"),
    fuzzy: bool = Query(False, description="是否启用模糊搜索"),
    db: Session = Depends(get_db)
):
    """
    根据名称搜索角色档案
    
    - **name**: 要搜索的角色名称
    - **fuzzy**: 是否启用模糊搜索（默认为精确搜索）
    """
    try:
        persona_service = PersonaService(db)
        
        if fuzzy:
            personas = persona_service.find_personas_by_name_fuzzy(name)
        else:
            persona = persona_service.find_persona_by_name(name)
            personas = [persona] if persona else []
        
        return [PersonaResponse.from_orm(persona) for persona in personas]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"搜索角色档案失败: {str(e)}"
        )

@router.get("/{persona_id}", response_model=PersonaResponse)
def get_persona(
    persona_id: int,
    db: Session = Depends(get_db)
):
    """
    获取指定ID的角色档案
    
    - **persona_id**: 角色档案ID
    """
    try:
        persona_service = PersonaService(db)
        persona = persona_service.get_persona_by_id(persona_id)
        
        if not persona:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="角色档案不存在"
            )
        
        return PersonaResponse.from_orm(persona)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取角色档案失败: {str(e)}"
        )

@router.get("/{persona_id}/stats", response_model=Dict[str, Any])
def get_persona_with_stats(
    persona_id: int,
    db: Session = Depends(get_db)
):
    """
    获取带统计信息的角色档案
    
    - **persona_id**: 角色档案ID
    - 返回角色档案信息及其占卜报告统计
    """
    try:
        persona_service = PersonaService(db)
        result = persona_service.get_persona_with_stats(persona_id)
        
        return result
        
    except Exception as e:
        if "不存在" in str(e):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="角色档案不存在"
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取角色档案统计失败: {str(e)}"
        )

@router.put("/{persona_id}", response_model=PersonaResponse)
def update_persona(
    persona_id: int,
    persona_data: PersonaUpdate,
    db: Session = Depends(get_db)
):
    """
    更新角色档案
    
    - **persona_id**: 角色档案ID
    - **persona_data**: 要更新的字段数据
    """
    try:
        persona_service = PersonaService(db)
        persona = persona_service.update_persona(persona_id, persona_data)
        
        return PersonaResponse.from_orm(persona)
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"数据验证失败: {str(e)}"
        )
    except Exception as e:
        if "不存在" in str(e):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="角色档案不存在"
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"更新角色档案失败: {str(e)}"
        )

@router.delete("/{persona_id}", response_model=MessageResponse)
def delete_persona(
    persona_id: int,
    db: Session = Depends(get_db)
):
    """
    删除角色档案
    
    - **persona_id**: 角色档案ID
    - 注意：如果角色档案有关联的占卜报告，将无法删除
    """
    try:
        persona_service = PersonaService(db)
        success = persona_service.delete_persona(persona_id)
        
        if success:
            return MessageResponse(
                message="角色档案删除成功",
                success=True
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="删除操作失败"
            )
        
    except Exception as e:
        if "不存在" in str(e):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="角色档案不存在"
            )
        elif "无法删除" in str(e):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"删除角色档案失败: {str(e)}"
        )
