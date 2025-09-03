# 本地Docker测试命令 - 占卜系统前端

# 1. 构建Docker镜像（在前端项目根目录运行）
echo "📦 构建前端Docker镜像..."
docker build -t divination-frontend:local .

# 如果需要传入Gemini API Key（构建时）
docker build --build-arg GEMINI_API_KEY=AIzaSyAY0oe9bTBRbP86yar5UkCWmIcY2ow0Gr4 -t divination-frontend:local .

# 2. 运行容器测试
echo "🚀 启动容器..."
docker run -d \
    --name divination-frontend-test \
    -p 8080:80 \
    divination-frontend:local

# 3. 查看容器状态
echo "📋 检查容器状态..."
docker ps

# 4. 查看容器日志（如果有问题）
echo "📄 查看日志..."
docker logs divination-frontend-test

# 5. 测试访问
echo "🌐 测试地址："
echo "前端: http://localhost:8080"
echo ""
echo "✅ 打开浏览器测试以下功能："
echo "1. 页面是否正常加载"
echo "2. 路由跳转是否正常"
echo "3. 与后端API的连接是否正常"
echo "4. 占卜功能是否完整"

# 6. 停止和清理容器（测试完成后）
echo ""
echo "🧹 测试完成后，运行以下命令清理："
echo "docker stop divination-frontend-test"
echo "docker rm divination-frontend-test"
echo "docker rmi divination-frontend:local"