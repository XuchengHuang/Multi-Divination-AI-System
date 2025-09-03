# init_testuser.py - 初始化测试用户脚本（增强版）
import sys
import os

def check_imports():
    """检查所需的模块导入"""
    print("🔍 检查模块导入...")
    
    try:
        print("   - 检查 database.py...")
        from database import SessionLocal, engine
        print("   ✅ database.py 导入成功")
        
        print("   - 检查 models.py...")
        from models import Base, User, AuthProvider, UserRole
        print("   ✅ models.py 导入成功")
        
        print("   - 检查数据库连接...")
        db = SessionLocal()
        db.close()
        print("   ✅ 数据库连接正常")
        
        return True
        
    except ImportError as e:
        print(f"   ❌ 导入错误: {e}")
        print("\n💡 解决建议:")
        print("   1. 确保在项目根目录运行此脚本")
        print("   2. 确保 database.py 和 models.py 文件存在")
        print("   3. 检查 .env 文件配置")
        return False
    except Exception as e:
        print(f"   ❌ 其他错误: {e}")
        return False

def create_test_user():
    """创建测试用户"""
    print("\n" + "=" * 60)
    print("🚀 初始化测试用户")
    print("=" * 60)
    
    # 检查导入
    if not check_imports():
        return None
    
    # 现在安全地导入
    from database import SessionLocal
    from models import User, AuthProvider, UserRole
    from sqlalchemy.orm import Session
    
    # 创建数据库会话
    db: Session = SessionLocal()
    
    try:
        # 检查是否已存在测试用户
        print("\n📝 检查现有测试用户...")
        existing_user = db.query(User).filter(User.username == "testuser").first()
        
        if existing_user:
            print(f"⚠️  测试用户已存在:")
            print(f"   ID: {existing_user.id}")
            print(f"   用户名: {existing_user.username}")
            print(f"   显示名称: {existing_user.display_name}")
            print(f"   创建时间: {existing_user.created_at}")
            print("   ✅ 使用现有的测试用户")
            return existing_user.id
        
        # 创建新的测试用户
        print("📝 创建新的测试用户...")
        test_user = User(
            username="testuser",
            display_name="测试用户",
            auth_provider=AuthProvider.GUEST,
            role=UserRole.FREE,
            is_active=True,
            is_verified=False
        )
        
        # 保存到数据库
        db.add(test_user)
        db.commit()
        db.refresh(test_user)
        
        print("✅ 测试用户创建成功!")
        print(f"   ID: {test_user.id}")
        print(f"   用户名: {test_user.username}")
        print(f"   显示名称: {test_user.display_name}")
        print(f"   认证方式: {test_user.auth_provider.value}")
        print(f"   用户角色: {test_user.role.value}")
        print(f"   创建时间: {test_user.created_at}")
        
        return test_user.id
        
    except Exception as e:
        print(f"❌ 创建测试用户失败: {e}")
        print(f"错误类型: {type(e).__name__}")
        db.rollback()
        return None
    finally:
        db.close()

def create_database_tables():
    """创建数据库表"""
    print("\n📊 创建数据库表...")
    
    try:
        from database import engine
        from models import Base
        
        Base.metadata.create_all(bind=engine)
        print("✅ 数据库表创建成功!")
        return True
    except Exception as e:
        print(f"❌ 数据库表创建失败: {e}")
        print(f"错误类型: {type(e).__name__}")
        return False

def verify_test_user():
    """验证测试用户是否正确创建"""
    print("\n🔍 验证测试用户...")
    
    try:
        from database import SessionLocal
        from models import User
        from sqlalchemy.orm import Session
        
        db: Session = SessionLocal()
        
        try:
            test_user = db.query(User).filter(User.username == "testuser").first()
            
            if test_user:
                print("✅ 测试用户验证成功!")
                print(f"   📊 TEST_USER_ID = {test_user.id}")
                
                # 检查关联表是否正常
                try:
                    persona_count = len(test_user.personas)
                    reading_count = len(test_user.readings)
                    
                    print(f"   📁 关联的Persona数量: {persona_count}")
                    print(f"   📖 关联的Reading数量: {reading_count}")
                except Exception as relation_error:
                    print(f"   ⚠️  关联表检查出错: {relation_error}")
                
                return test_user.id
            else:
                print("❌ 测试用户验证失败!")
                return None
                
        finally:
            db.close()
            
    except Exception as e:
        print(f"❌ 验证过程出错: {e}")
        return None

def update_constants_file(test_user_id):
    """更新constants.py文件中的TEST_USER_ID"""
    if test_user_id is None:
        return
        
    print(f"\n📝 更新constants.py文件...")
    
    constants_content = f'''# constants.py - 项目常量配置

# ===== 测试用户配置 =====
TEST_USER_ID = {test_user_id}  # 测试用户ID
TEST_USERNAME = "testuser"

# ===== AI相关常量 =====
DEFAULT_AI_MODEL = "gemini-pro"
DEFAULT_CONFIDENCE_SCORE = 85
DEFAULT_PROCESSING_TIME = 30  # 默认处理时间（秒）

# ===== 业务规则常量 =====
MAX_READING_METHODS = 5  # 单次最多选择的占卜方法数
MIN_READING_METHODS = 1  # 单次最少选择的占卜方法数
MAX_CHARACTER_ARCHETYPES = 10  # 最多角色原型数量

# ===== 数据验证常量 =====
MIN_QUESTION_LENGTH = 5   # 问题最小长度
MAX_QUESTION_LENGTH = 1000  # 问题最大长度
MIN_REPORT_LENGTH = 10    # 报告最小长度
MAX_NAME_LENGTH = 255     # 姓名最大长度

# ===== 系统消息常量 =====
SUCCESS_MESSAGES = {{
    "BATCH_SAVE_SUCCESS": "所有报告已保存成功",
    "PERSONA_CREATED": "角色档案创建成功",
    "PERSONA_UPDATED": "角色档案更新成功",
    "READING_UPDATED": "报告更新成功"
}}

ERROR_MESSAGES = {{
    "PERSONA_NOT_FOUND": "角色档案未找到",
    "READING_NOT_FOUND": "报告未找到",
    "INVALID_METHOD": "无效的占卜方法",
    "INSUFFICIENT_DATA": "输入数据不足"
}}
'''
    
    try:
        with open("constants.py", "w", encoding="utf-8") as f:
            f.write(constants_content)
        print(f"✅ constants.py 已更新，TEST_USER_ID = {test_user_id}")
    except Exception as e:
        print(f"⚠️  更新constants.py失败: {e}")

def main():
    """主函数"""
    print("🎯 多元占卜AI系统 - 测试用户初始化工具")
    print(f"📂 当前工作目录: {os.getcwd()}")
    
    # 检查必要文件是否存在
    required_files = ["database.py", "models.py", "config.py"]
    missing_files = []
    
    for file in required_files:
        if not os.path.exists(file):
            missing_files.append(file)
    
    if missing_files:
        print(f"❌ 缺少必要文件: {missing_files}")
        print("请确保在项目根目录运行此脚本")
        return
    
    try:
        # 1. 创建数据库表
        if not create_database_tables():
            print("数据库表创建失败，停止初始化")
            return
        
        # 2. 创建测试用户
        test_user_id = create_test_user()
        if test_user_id is None:
            print("测试用户创建失败，停止初始化")
            return
        
        # 3. 验证测试用户
        verified_id = verify_test_user()
        if verified_id is None:
            print("测试用户验证失败")
            return
        
        # 4. 更新constants.py文件
        update_constants_file(test_user_id)
        
        # 5. 输出成功信息
        print("\n" + "=" * 60)
        print("🎉 初始化完成!")
        print("=" * 60)
        print(f"✅ TEST_USER_ID = {test_user_id}")
        print("✅ constants.py 文件已更新")
        print("✅ 可以开始开发API了！")
        print("=" * 60)
        print("\n💡 接下来你可以:")
        print("   1. 在API中使用 'from constants import TEST_USER_ID'")
        print("   2. 所有前端数据都会保存到这个测试用户下")
        print("   3. 将来上线用户系统时，可以迁移这些数据")
        
    except Exception as e:
        print(f"\n💥 初始化过程中出现错误: {e}")
        print("请检查:")
        print("  - 数据库连接配置(.env文件)")
        print("  - 数据库是否启动")
        print("  - 文件权限是否正确")

if __name__ == "__main__":
    main()

# constants.py - 常量文件（创建这个文件供其他模块使用）
"""
# 在项目根目录创建 constants.py 文件，内容如下：

# 测试用户ID常量
TEST_USER_ID = 1  # 这个值在运行init_testuser.py后会确定

# 其他常量
DEFAULT_AI_MODEL = "gemini-pro"
DEFAULT_CONFIDENCE_SCORE = 85
"""