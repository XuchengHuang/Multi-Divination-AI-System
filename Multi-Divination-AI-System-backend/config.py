# from pydantic_settings import BaseSettings
# from typing import List

# class Settings(BaseSettings):
#     # 应用基础设置
#     app_name: str = "多元占卜AI系统后端"
#     debug: bool = True
#     version: str = "1.0.0"
    
#     # 数据库设置 - 先用SQLite，后面改成GCP SQL
#     database_url: str = "sqlite:///./divination.db"
    
#     # Gemini AI API设置
#     gemini_api_key: str = ""  # 通过.env文件设置
    
#     # 认证设置（为将来的用户系统准备）
#     secret_key: str = "fallback-development-secret"  # .env会覆盖这个默认值
#     algorithm: str = "HS256"
#     access_token_expire_minutes: int = 60 * 24  # 24小时
    
#     # CORS设置 - 允许前端访问
#     allowed_origins: List[str] = [
#         "http://localhost:3000",
#         "http://localhost:8080",
#         "http://127.0.0.1:3000",
#         "http://127.0.0.1:8080",
#     ]
    
#     class Config:
#         env_file = ".env"
#         case_sensitive = False  # 环境变量不区分大小写

# # 创建全局settings实例
# settings = Settings()


from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    # 应用基础设置
    app_name: str = "多元占卜AI系统后端"
    debug: bool = True
    version: str = "1.0.0"
    environment: str = "development"  # development, production
    
    # 数据库设置 - 环境变量控制
    database_url: str = "sqlite:///./divination.db"  # 默认开发环境
    
    # 生产环境数据库配置
    db_host: str = ""
    db_name: str = "divination_db"
    db_user: str = ""
    db_password: str = ""
    db_port: int = 5432
    
    # Cloud SQL 连接名称（用于 Unix 套接字）
    cloud_sql_connection_name: str = ""
    
    # Gemini AI API设置 (暂时不用，但保留配置)
    gemini_api_key: str = ""
    
    # 认证设置
    secret_key: str = "fallback-development-secret"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24
    
    # CORS设置 - 生产环境需要更新
    allowed_origins: List[str] = [
        "http://localhost:3000",
        "http://localhost:8080", 
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8080",
    ]
    
    def get_database_url(self) -> str:
        """根据环境返回对应的数据库URL"""
        if self.environment == "production":
            if self.cloud_sql_connection_name:
                # Cloud Run 环境：使用 Unix 套接字连接
                return f"postgresql://{self.db_user}:{self.db_password}@/{self.db_name}?host=/cloudsql/{self.cloud_sql_connection_name}"
            elif self.db_host:
                # 标准 TCP 连接
                return f"postgresql://{self.db_user}:{self.db_password}@{self.db_host}:{self.db_port}/{self.db_name}"
        
        # 开发环境使用SQLite
        return self.database_url
    
    class Config:
        env_file = ".env"
        case_sensitive = False

# 创建全局settings实例
settings = Settings()

# 动态设置数据库URL
settings.database_url = settings.get_database_url()
