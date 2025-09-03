# constants.py - 项目常量配置

# ===== 测试用户配置 =====
TEST_USER_ID = 1  # 测试用户ID
TEST_USERNAME = "testuser"

# ===== AI相关常量 =====
DEFAULT_AI_MODEL = "gemini-2.5-flash"  # 使用 Gemini Flash 2.5
DEFAULT_CONFIDENCE_SCORE = 85
DEFAULT_PROCESSING_TIME = 30  # 默认处理时间（秒）

# Gemini Flash 2.5 特定配置
GEMINI_CONFIG = {
    "MODEL_NAME": "gemini-2.5-flash",
    "MAX_TOKENS": 8192,              # Gemini Flash 2.5 的最大token数
    "TEMPERATURE": 0.7,              # 创造性参数
    "TOP_P": 0.9,                    # 采样参数
    "TOP_K": 40,                     # 候选词数量
    "SAFETY_THRESHOLD": "BLOCK_MEDIUM_AND_ABOVE"  # 安全过滤级别
}

# ===== 业务规则常量 =====
MAX_READING_METHODS = 5  # 单次最多选择的占卜方法数
MIN_READING_METHODS = 1  # 单次最少选择的占卜方法数
MAX_CHARACTER_ARCHETYPES = 10  # 最多角色原型数量

# ===== 数据验证常量 =====
MIN_QUESTION_LENGTH = 5   # 问题最小长度
MAX_QUESTION_LENGTH = 1000  # 问题最大长度
MIN_REPORT_LENGTH = 10    # 报告最小长度
MAX_NAME_LENGTH = 255     # 姓名最大长度
MIN_NAME_LENGTH = 1       # 姓名最小长度
MAX_DESCRIPTION_LENGTH = 1000  # 描述最大长度
MAX_FEEDBACK_LENGTH = 1000     # 反馈最大长度

# ===== 分页和查询常量 =====
DEFAULT_PAGE_SIZE = 20        # 默认分页大小
MAX_PAGE_SIZE = 100          # 最大分页大小
MIN_PAGE_SIZE = 1            # 最小分页大小

# ===== 评分常量 =====
MIN_USER_RATING = 1          # 最小评分
MAX_USER_RATING = 5          # 最大评分

# ===== 系统消息常量 =====
SUCCESS_MESSAGES = {
    "BATCH_SAVE_SUCCESS": "所有报告已保存成功",
    "PERSONA_CREATED": "角色档案创建成功",
    "PERSONA_UPDATED": "角色档案更新成功",
    "PERSONA_DELETED": "角色档案删除成功",
    "READING_CREATED": "报告创建成功",
    "READING_UPDATED": "报告更新成功",
    "READING_DELETED": "报告删除成功",
    "BATCH_DELETE_SUCCESS": "批量删除成功"
}

ERROR_MESSAGES = {
    "PERSONA_NOT_FOUND": "角色档案未找到",
    "READING_NOT_FOUND": "报告未找到",
    "USER_NOT_FOUND": "用户不存在",
    "INVALID_METHOD": "无效的占卜方法",
    "INSUFFICIENT_DATA": "输入数据不足",
    "DUPLICATE_PERSONA": "角色档案名称已存在",
    "PERSONA_HAS_READINGS": "无法删除有占卜记录的角色档案，请先删除相关占卜记录",
    "INVALID_INPUT": "输入数据无效",
    "DATABASE_ERROR": "数据库操作失败",
    "PERMISSION_DENIED": "权限不足",
    "INVALID_RATING": f"评分必须在 {MIN_USER_RATING} 到 {MAX_USER_RATING} 之间",
    "INVALID_PAGE_SIZE": f"分页大小必须在 {MIN_PAGE_SIZE} 到 {MAX_PAGE_SIZE} 之间"
}

# ===== 占卜方法配置 =====
DIVINATION_METHODS = {
    "LIFEPATH": "LifePathNumber",
    "PALMISTRY": "Palmistry", 
    "ASTROLOGY": "Astrology",
    "MBTI": "MBTI",
    "TAROT": "Tarot",
    "INTEGRATED": "Integrated"
}

METHOD_DESCRIPTIONS = {
    "LifePathNumber": "生命数字占卜 - 通过生日数字分析人生轨迹",
    "Palmistry": "手相分析 - 通过手掌纹路解读性格命运",
    "Astrology": "占星学分析 - 基于出生时间地点的星象分析",
    "MBTI": "性格类型测试 - 心理学性格分析工具",
    "Tarot": "塔罗牌占卜 - 通过塔罗卡牌预测和指导",
    "Integrated": "综合分析报告 - 多种方法的综合解读"
}

# ===== API 配置常量 =====
API_CONFIG = {
    "TITLE": "占卜系统API",
    "VERSION": "1.0.0",
    "DESCRIPTION": "AI驱动的多方法占卜系统",
    "CONTACT": {
        "name": "占卜系统开发团队",
        "email": "support@divination.com"
    }
}

# ===== 数据库配置常量 =====
DATABASE_CONFIG = {
    "SQLITE_FILE": "divination.db",
    "CONNECTION_POOL_SIZE": 5,
    "MAX_OVERFLOW": 10,
    "POOL_TIMEOUT": 30,
    "POOL_RECYCLE": 3600
}