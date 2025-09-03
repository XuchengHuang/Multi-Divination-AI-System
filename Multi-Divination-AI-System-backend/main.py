# main.py - FastAPI 主应用文件
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import uvicorn
from datetime import datetime

# 导入路由
from routers import persona_routes, batch_routes, reading_routes

# 导入数据库相关
from database import engine, get_db
from models import Base

# 生命周期管理
@asynccontextmanager
async def lifespan(app: FastAPI):
    # 启动时执行
    print("🚀 启动占卜系统API...")
    
    # 创建数据库表（如果不存在）
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ 数据库表创建/检查完成")
    except Exception as e:
        print(f"❌ 数据库初始化失败: {e}")
    
    yield
    
    # 关闭时执行
    print("🛑 关闭占卜系统API...")

# 创建 FastAPI 应用实例
app = FastAPI(
    title="占卜系统API",
    description="""
    一个完整的AI占卜系统后端API，支持多种占卜方法：

    ## 主要功能
    - **角色档案管理**: 创建和管理用户的占卜角色档案
    - **批量占卜**: 一次性创建多种方法的占卜报告
    - **单个占卜**: 创建和管理单个占卜报告  
    - **数据统计**: 提供用户活动和报告统计信息

    ## 支持的占卜方法
    - 塔罗牌 (Tarot)
    - 占星学 (Astrology) 
    - MBTI性格测试
    - 手相分析 (Palmistry)
    - 生命数字 (LifePathNumber)
    - 综合分析 (Integrated)
    """,
    version="1.0.0",
    contact={
        "name": "K&L Development Team",
        "email": "XuchengHuang02@gmail.com",
    },
    license_info={
        "name": "***",
    },
    lifespan=lifespan
)

# CORS 中间件配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 在生产环境中应该指定具体的域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 全局异常处理器
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "status_code": exc.status_code,
            "timestamp": datetime.utcnow().isoformat(),
            "path": str(request.url)
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={
            "error": "内部服务器错误",
            "detail": str(exc),
            "status_code": 500,
            "timestamp": datetime.utcnow().isoformat(),
            "path": str(request.url)
        }
    )

# 根路径
@app.get("/", tags=["根路径"])
def read_root():
    """
    API根路径 - 基本信息
    """
    return {
        "message": "欢迎使用占卜系统API",
        "version": "1.0.0",
        "status": "running",
        "timestamp": datetime.utcnow().isoformat(),
        "documentation": "/docs",
        "endpoints": {
            "personas": "/personas",
            "batch": "/batch", 
            "readings": "/readings"
        }
    }

# 健康检查
@app.get("/health", tags=["系统"])
def health_check():
    """
    系统健康检查
    """
    try:
        # 测试数据库连接
        db = next(get_db())
        db.execute("SELECT 1")
        db_status = "healthy"
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"
    
    return {
        "status": "healthy" if db_status == "healthy" else "unhealthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0",
        "services": {
            "api": "healthy",
            "database": db_status
        }
    }

# API信息
@app.get("/info", tags=["系统"])
def api_info():
    """
    API详细信息
    """
    return {
        "name": "占卜系统API",
        "version": "1.0.0",
        "description": "AI驱动的多方法占卜系统",
        "features": [
            "角色档案管理",
            "批量占卜创建", 
            "单个报告管理",
            "数据统计分析",
            "多种占卜方法支持"
        ],
        "divination_methods": [
            "Tarot - 塔罗牌",
            "Astrology - 占星学",
            "MBTI - 性格测试", 
            "Palmistry - 手相分析",
            "LifePathNumber - 生命数字",
            "Integrated - 综合分析"
        ],
        "endpoints_count": {
            "personas": 6,
            "batch": 5,
            "readings": 8
        }
    }

# 注册路由模块
app.include_router(
    persona_routes.router,
    # prefix="/api/v1"  # 如果需要版本前缀可以取消注释
)

app.include_router(
    batch_routes.router,
    # prefix="/api/v1"
)

app.include_router(
    reading_routes.router,
    # prefix="/api/v1"
)

# 开发服务器启动配置
if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,  # 开发模式，文件变更时自动重载
        reload_dirs=["./"],  # 监听当前目录
        log_level="info"
    )