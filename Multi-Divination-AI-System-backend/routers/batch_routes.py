# routers/batch_routes.py - 批量操作路由
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any

from database import get_db
from services.batch_service import BatchService
from schemas import BatchReadingCreate, BatchReadingResponse, MessageResponse
from constants import ERROR_MESSAGES

# 创建路由器
router = APIRouter(
    prefix="/batch",
    tags=["batch"],
    responses={404: {"description": "Not found"}}
)

@router.post("/readings", response_model=BatchReadingResponse)
def create_batch_readings(
    batch_data: BatchReadingCreate,
    db: Session = Depends(get_db)
):
    """
    批量创建占卜报告
    
    - **batch_data**: 包含用户信息、问题、各方法的报告和输入数据
    - 返回创建的persona和所有报告信息
    """
    try:
        # 创建批量服务实例
        batch_service = BatchService(db)
        
        # 执行批量创建
        result = batch_service.create_batch_readings(batch_data)
        
        return result
        
    except ValueError as e:
        # 数据验证错误
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"数据验证失败: {str(e)}"
        )
    except Exception as e:
        # 其他业务逻辑错误
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"批量创建失败: {str(e)}"
        )

@router.get("/summary", response_model=Dict[str, Any])
def get_user_batch_summary(
    db: Session = Depends(get_db)
):
    """
    获取用户的批量操作汇总统计
    
    - 返回用户信息、统计数据和最近的报告
    """
    try:
        # 创建批量服务实例
        batch_service = BatchService(db)
        
        # 获取汇总信息
        summary = batch_service.get_user_batch_summary()
        
        return summary
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取汇总信息失败: {str(e)}"
        )

@router.get("/personas/{persona_id}/readings/count")
def get_persona_reading_count(
    persona_id: int,
    db: Session = Depends(get_db)
):
    """
    获取指定persona的报告数量
    
    - **persona_id**: 角色档案ID
    - 返回该persona的报告总数
    """
    try:
        batch_service = BatchService(db)
        count = batch_service.get_persona_reading_count(persona_id)
        
        return {
            "persona_id": persona_id,
            "reading_count": count,
            "success": True
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取报告数量失败: {str(e)}"
        )

@router.delete("/personas/{persona_id}/readings", response_model=Dict[str, Any])
def delete_persona_readings(
    persona_id: int,
    db: Session = Depends(get_db)
):
    """
    删除指定persona的所有报告（批量删除）
    
    - **persona_id**: 角色档案ID  
    - 删除该persona下的所有报告
    """
    try:
        batch_service = BatchService(db)
        result = batch_service.delete_batch_readings(persona_id)
        
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"批量删除失败: {str(e)}"
        )

