# routers/reading_routes.py - 占卜报告路由
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any

from database import get_db
from services.reading_service import ReadingService
from schemas import SingleReadingCreate, ReadingUpdate, ReadingResponse, MessageResponse
from models import DivinationMethod
from constants import ERROR_MESSAGES, SUCCESS_MESSAGES

# 创建路由器
router = APIRouter(
    prefix="/readings",
    tags=["readings"],
    responses={404: {"description": "Not found"}}
)

@router.post("/", response_model=ReadingResponse)
def create_reading(
    reading_data: SingleReadingCreate,
    db: Session = Depends(get_db)
):
    """
    创建单个占卜报告
    
    - **reading_data**: 包含占卜报告的完整信息
    - 可以指定 persona_id 关联到特定角色档案
    """
    try:
        reading_service = ReadingService(db)
        reading = reading_service.create_reading(reading_data)
        
        return ReadingResponse.from_orm(reading)
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"数据验证失败: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"创建占卜报告失败: {str(e)}"
        )

@router.get("/", response_model=List[ReadingResponse])
def get_user_readings(
    persona_id: Optional[int] = Query(None, description="按角色档案ID过滤"),
    method: Optional[DivinationMethod] = Query(None, description="按占卜方法过滤"),
    limit: int = Query(20, ge=1, le=100, description="返回数量限制"),
    offset: int = Query(0, ge=0, description="偏移量"),
    db: Session = Depends(get_db)
):
    """
    获取用户的占卜报告列表
    
    - **persona_id**: 可选，按角色档案ID过滤
    - **method**: 可选，按占卜方法过滤
    - **limit**: 返回数量限制（1-100）
    - **offset**: 偏移量，用于分页
    """
    try:
        reading_service = ReadingService(db)
        readings = reading_service.get_readings_by_user(
            persona_id=persona_id,
            method=method,
            limit=limit,
            offset=offset
        )
        
        return [ReadingResponse.from_orm(reading) for reading in readings]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取占卜报告列表失败: {str(e)}"
        )

@router.get("/{reading_id}", response_model=ReadingResponse)
def get_reading(
    reading_id: int,
    db: Session = Depends(get_db)
):
    """
    获取指定ID的占卜报告
    
    - **reading_id**: 占卜报告ID
    """
    try:
        reading_service = ReadingService(db)
        reading = reading_service.get_reading_by_id(reading_id)
        
        if not reading:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="占卜报告不存在"
            )
        
        return ReadingResponse.from_orm(reading)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取占卜报告失败: {str(e)}"
        )

@router.get("/{reading_id}/details", response_model=Dict[str, Any])
def get_reading_with_sources(
    reading_id: int,
    db: Session = Depends(get_db)
):
    """
    获取带关联信息的占卜报告
    
    - **reading_id**: 占卜报告ID
    - 如果是综合报告，返回源报告信息
    - 如果是单独报告，返回相关的综合报告信息
    """
    try:
        reading_service = ReadingService(db)
        result = reading_service.get_reading_with_sources(reading_id)
        
        return result
        
    except Exception as e:
        if "不存在" in str(e):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="占卜报告不存在"
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取占卜报告详情失败: {str(e)}"
        )

@router.put("/{reading_id}", response_model=ReadingResponse)
def update_reading(
    reading_id: int,
    reading_data: ReadingUpdate,
    db: Session = Depends(get_db)
):
    """
    更新占卜报告
    
    - **reading_id**: 占卜报告ID
    - **reading_data**: 要更新的字段数据（收藏、评分、反馈等）
    """
    try:
        reading_service = ReadingService(db)
        reading = reading_service.update_reading(reading_id, reading_data)
        
        return ReadingResponse.from_orm(reading)
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"数据验证失败: {str(e)}"
        )
    except Exception as e:
        if "不存在" in str(e):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="占卜报告不存在"
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"更新占卜报告失败: {str(e)}"
        )

@router.delete("/{reading_id}", response_model=MessageResponse)
def delete_reading(
    reading_id: int,
    db: Session = Depends(get_db)
):
    """
    删除占卜报告
    
    - **reading_id**: 占卜报告ID
    """
    try:
        reading_service = ReadingService(db)
        success = reading_service.delete_reading(reading_id)
        
        if success:
            return MessageResponse(
                message="占卜报告删除成功",
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
                detail="占卜报告不存在"
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"删除占卜报告失败: {str(e)}"
        )

@router.get("/favorites/list", response_model=List[ReadingResponse])
def get_favorite_readings(
    limit: int = Query(20, ge=1, le=100, description="返回数量限制"),
    offset: int = Query(0, ge=0, description="偏移量"),
    db: Session = Depends(get_db)
):
    """
    获取用户收藏的占卜报告
    
    - **limit**: 返回数量限制（1-100）
    - **offset**: 偏移量，用于分页
    """
    try:
        reading_service = ReadingService(db)
        
        # 获取用户所有报告，然后过滤收藏的
        readings = reading_service.get_readings_by_user(limit=1000)  # 先获取足够多的报告
        favorite_readings = [r for r in readings if r.is_favorite]
        
        # 手动分页
        paginated_favorites = favorite_readings[offset:offset + limit]
        
        return [ReadingResponse.from_orm(reading) for reading in paginated_favorites]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取收藏报告失败: {str(e)}"
        )

@router.get("/methods/{method}/list", response_model=List[ReadingResponse])
def get_readings_by_method(
    method: DivinationMethod,
    limit: int = Query(20, ge=1, le=100, description="返回数量限制"),
    offset: int = Query(0, ge=0, description="偏移量"),
    db: Session = Depends(get_db)
):
    """
    获取指定占卜方法的报告
    
    - **method**: 占卜方法
    - **limit**: 返回数量限制（1-100）
    - **offset**: 偏移量，用于分页
    """
    try:
        reading_service = ReadingService(db)
        readings = reading_service.get_readings_by_user(
            method=method,
            limit=limit,
            offset=offset
        )
        
        return [ReadingResponse.from_orm(reading) for reading in readings]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取{method.value}报告失败: {str(e)}"
        )