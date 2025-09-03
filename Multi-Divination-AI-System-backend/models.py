from datetime import datetime
from enum import Enum
from sqlalchemy import (
    Column, Integer, String, Text, DateTime, Boolean,
    ForeignKey, Enum as SqlEnum, Index, UniqueConstraint,
    JSON, DECIMAL
)
from sqlalchemy.orm import relationship
from database import Base

class DivinationMethod(str, Enum):
    LIFEPATH = "LifePathNumber"
    PALMISTRY = "Palmistry"
    ASTROLOGY = "Astrology"
    MBTI = "MBTI"
    TAROT = "Tarot"
    INTEGRATED = "Integrated"

class UserRole(str, Enum):
    FREE = "free"
    PREMIUM = "premium"
    ADMIN = "admin"

class AuthProvider(str, Enum):
    GOOGLE = "google"
    EMAIL = "email"
    GUEST = "guest"

class ReadingStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    
    # 保持您原有的设计
    username = Column(String(255), unique=True, nullable=True, index=True)
    hashed_password = Column(String(255), nullable=True)
    
    # 扩展认证相关字段
    email = Column(String(255), unique=True, nullable=True, index=True)
    display_name = Column(String(255), nullable=True)
    google_id = Column(String(255), unique=True, nullable=True, index=True)
    auth_provider = Column(SqlEnum(AuthProvider, native_enum=True), default=AuthProvider.GUEST)
    
    # 用户状态和角色
    role = Column(SqlEnum(UserRole, native_enum=True), default=UserRole.FREE)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    
    # 个人资料
    profile_picture = Column(String(500), nullable=True)
    bio = Column(Text, nullable=True)
    birth_date = Column(DateTime, nullable=True)  # 用于占星等功能
    timezone = Column(String(50), default="UTC")
    
    # 时间戳 - 保持您原有的设计
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    last_login_at = Column(DateTime, nullable=True)
    
    # 关系 - 保持您原有的设计并扩展
    personas = relationship("Persona", back_populates="user", passive_deletes=True)
    readings = relationship("Reading", back_populates="user", passive_deletes=True)
    chat_sessions = relationship("ChatSession", back_populates="user", passive_deletes=True)
    subscriptions = relationship("Subscription", back_populates="user", passive_deletes=True)
    
    __table_args__ = (
        Index("ix_users_email_active", "email", "is_active"),
        Index("ix_users_provider_id", "auth_provider", "google_id"),
    )

class Persona(Base):
    __tablename__ = "personas"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # 基本信息
    display_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    
    # 占卜需要的基础信息
    birth_date = Column(DateTime, nullable=True)
    birth_time = Column(String(10), nullable=True)  # HH:MM 格式
    birth_location = Column(String(255), nullable=True)
    gender = Column(String(20), nullable=True)
    
    # 角色原型标签（从前端AI生成的结果）
    character_archetypes = Column(JSON, nullable=True)  # 存储生成的角色标签
    
    # 时间戳
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # 关系
    user = relationship("User", back_populates="personas")
    readings = relationship("Reading", back_populates="persona", passive_deletes=True)
    
    __table_args__ = (
        Index("ix_personas_user_name", "user_id", "display_name"),
        Index("ix_personas_user_created", "user_id", "created_at"),
    )

class Reading(Base):
    __tablename__ = "readings"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    persona_id = Column(Integer, ForeignKey("personas.id", ondelete="CASCADE"), nullable=True)
    
    # 核心信息 - 保持您原有的设计
    method = Column(SqlEnum(DivinationMethod, native_enum=True, length=32), nullable=False, index=True)
    main_question = Column(Text, nullable=False)
    output_text = Column(Text, nullable=False)
    
    # 扩展信息
    input_data = Column(JSON, nullable=True)  # 存储输入的原始数据
    status = Column(SqlEnum(ReadingStatus, native_enum=True), default=ReadingStatus.PENDING)
    
    # AI相关信息
    ai_model_used = Column(String(100), nullable=True)  # 记录使用的AI模型
    processing_time = Column(Integer, nullable=True)  # 处理时间(秒)
    confidence_score = Column(Integer, nullable=True)  # AI置信度(1-100)
    
    # 用户交互
    is_favorite = Column(Boolean, default=False)
    user_rating = Column(Integer, nullable=True)  # 用户评分(1-5)
    user_feedback = Column(Text, nullable=True)
    
    # 分享和隐私
    is_public = Column(Boolean, default=False)
    sharing_token = Column(String(100), unique=True, nullable=True)  # 用于分享链接
    
    # 时间戳 - 保持您原有的设计
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # 关系 - 保持您原有的设计
    user = relationship("User", back_populates="readings")
    persona = relationship("Persona", back_populates="readings")
    
    # 作为综合报告的源报告
    integrated_readings = relationship(
        "ReadingSource",
        foreign_keys="ReadingSource.source_reading_id",
        back_populates="source_reading",
        passive_deletes=True
    )
    
    # 作为源报告的综合报告
    source_readings = relationship(
        "ReadingSource", 
        foreign_keys="ReadingSource.integrated_reading_id",
        back_populates="integrated_reading",
        passive_deletes=True
    )
    
    __table_args__ = (
        Index("ix_readings_user_created", "user_id", "created_at"),
        Index("ix_readings_persona_created", "persona_id", "created_at"),
        Index("ix_readings_method_status", "method", "status"),
        Index("ix_readings_user_method", "user_id", "method"),
        Index("ix_readings_sharing_token", "sharing_token"),
    )

class ReadingSource(Base):
    __tablename__ = "reading_sources"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    integrated_reading_id = Column(Integer, ForeignKey("readings.id", ondelete="CASCADE"), nullable=False)
    source_reading_id = Column(Integer, ForeignKey("readings.id", ondelete="CASCADE"), nullable=False)
    
    # 额外信息
    weight = Column(Integer, default=1)  # 在综合分析中的权重
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # 关系
    integrated_reading = relationship(
        "Reading", 
        foreign_keys=[integrated_reading_id],
        back_populates="source_readings"
    )
    source_reading = relationship(
        "Reading", 
        foreign_keys=[source_reading_id],
        back_populates="integrated_readings"
    )
    
    __table_args__ = (
        UniqueConstraint("integrated_reading_id", "source_reading_id", name="uq_integrated_source"),
        Index("ix_rs_integrated", "integrated_reading_id"),
        Index("ix_rs_source", "source_reading_id"),
    )

# ===== 以下是为未来功能准备的模型 =====

class ChatSessionType(str, Enum):
    GENERAL = "general"          # 普通聊天
    READING_DISCUSSION = "reading_discussion"  # 讨论特定报告
    GUIDANCE = "guidance"        # 人生指导

class ChatSession(Base):
    __tablename__ = "chat_sessions"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # 会话信息
    title = Column(String(255), nullable=True)  # 会话标题
    session_type = Column(SqlEnum(ChatSessionType, native_enum=True), default=ChatSessionType.GENERAL)
    
    # 关联信息
    related_reading_id = Column(Integer, ForeignKey("readings.id", ondelete="SET NULL"), nullable=True)
    persona_id = Column(Integer, ForeignKey("personas.id", ondelete="SET NULL"), nullable=True)
    
    # 会话状态
    is_active = Column(Boolean, default=True)
    is_archived = Column(Boolean, default=False)
    
    # AI配置
    ai_personality = Column(String(50), default="aura")  # AI助手人格
    context_data = Column(JSON, nullable=True)  # 会话上下文数据
    
    # 时间戳
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    last_message_at = Column(DateTime, nullable=True)
    
    # 关系
    user = relationship("User", back_populates="chat_sessions")
    messages = relationship("ChatMessage", back_populates="session", passive_deletes=True)
    related_reading = relationship("Reading", foreign_keys=[related_reading_id])
    persona = relationship("Persona", foreign_keys=[persona_id])
    
    __table_args__ = (
        Index("ix_chat_sessions_user_active", "user_id", "is_active"),
        Index("ix_chat_sessions_user_updated", "user_id", "updated_at"),
    )

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(Integer, ForeignKey("chat_sessions.id", ondelete="CASCADE"), nullable=False)
    
    # 消息内容
    content = Column(Text, nullable=False)
    is_user_message = Column(Boolean, nullable=False)
    
    # 消息元数据
    message_type = Column(String(50), default="text")  # text, image, file等
    message_metadata = Column(JSON, nullable=True)  # 存储额外信息如AI模型、处理时间等
    
    # 用户交互
    user_reaction = Column(String(20), nullable=True)  # 用户反应：like, dislike, love等
    is_edited = Column(Boolean, default=False)
    
    # 时间戳
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    edited_at = Column(DateTime, nullable=True)
    
    # 关系
    session = relationship("ChatSession", back_populates="messages")
    
    __table_args__ = (
        Index("ix_chat_messages_session_created", "session_id", "created_at"),
    )

class SubscriptionTier(str, Enum):
    FREE = "free"
    BASIC = "basic"
    PREMIUM = "premium"
    LIFETIME = "lifetime"

class SubscriptionStatus(str, Enum):
    ACTIVE = "active"
    CANCELLED = "cancelled"
    EXPIRED = "expired"
    PENDING = "pending"

class PaymentProvider(str, Enum):
    STRIPE = "stripe"
    PAYPAL = "paypal"
    ALIPAY = "alipay"
    WECHAT = "wechat"

class Subscription(Base):
    __tablename__ = "subscriptions"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # 订阅信息
    tier = Column(SqlEnum(SubscriptionTier, native_enum=True), nullable=False)
    status = Column(SqlEnum(SubscriptionStatus, native_enum=True), default=SubscriptionStatus.PENDING)
    
    # 时间信息
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=True)
    trial_end_date = Column(DateTime, nullable=True)
    
    # 支付信息
    payment_provider = Column(SqlEnum(PaymentProvider, native_enum=True), nullable=True)
    external_subscription_id = Column(String(255), nullable=True)  # 第三方订阅ID
    price_paid = Column(DECIMAL(10, 2), nullable=True)
    currency = Column(String(3), default="USD")
    
    # 功能限制
    monthly_reading_limit = Column(Integer, nullable=True)
    current_monthly_usage = Column(Integer, default=0)
    
    # 自动续费
    auto_renew = Column(Boolean, default=True)
    next_billing_date = Column(DateTime, nullable=True)
    
    # 时间戳
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    cancelled_at = Column(DateTime, nullable=True)
    
    # 关系
    user = relationship("User", back_populates="subscriptions")
    
    __table_args__ = (
        Index("ix_subscriptions_user_status", "user_id", "status"),
        Index("ix_subscriptions_external_id", "external_subscription_id"),
        Index("ix_subscriptions_end_date", "end_date"),
    )
