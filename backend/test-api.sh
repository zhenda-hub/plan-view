#!/bin/bash

# API 测试脚本

API_BASE="http://localhost:3000/api"

echo "=========================================="
echo "Plan View API 测试"
echo "=========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 测试函数
test_endpoint() {
  local name=$1
  local method=$2
  local endpoint=$3
  local data=$4

  echo -e "${YELLOW}测试:${NC} $name"
  echo "请求: $method $endpoint"

  if [ -z "$data" ]; then
    response=$(curl -s -X "$method" "$API_BASE$endpoint" -H "Content-Type: application/json")
  else
    echo "数据: $data"
    response=$(curl -s -X "$method" "$API_BASE$endpoint" -H "Content-Type: application/json" -d "$data")
  fi

  # 检查响应
  if echo "$response" | jq -e '.error' > /dev/null 2>&1; then
    echo -e "${RED}❌ 失败:${NC} $response"
    return 1
  else
    echo -e "${GREEN}✅ 成功:${NC}"
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
  fi
  echo ""
}

# 1. 健康检查
test_endpoint "健康检查" "GET" "/health"

# 2. 创建项目
PROJECT_RESPONSE=$(curl -s -X POST "$API_BASE/projects" -H "Content-Type: application/json" -d '{"name":"测试项目","description":"API测试项目"}')
PROJECT_ID=$(echo "$PROJECT_RESPONSE" | jq -r '.id')
echo -e "${GREEN}✅ 项目创建成功, ID: $PROJECT_ID${NC}"
echo ""

# 3. 获取所有项目
test_endpoint "获取所有项目" "GET" "/projects"

# 4. 创建任务
echo -e "${YELLOW}测试:${NC} 创建任务"
TASK_DATA=$(cat <<EOF
{
  "title": "测试任务 - API创建",
  "description": "通过API创建的测试任务",
  "startDate": "2026-01-01",
  "endDate": "2026-01-31",
  "level": "year",
  "status": "planned",
  "progress": 0,
  "type": "task",
  "color": "#10b981",
  "dependencies": [],
  "projectId": "$PROJECT_ID"
}
EOF
)
TASK_RESPONSE=$(curl -s -X POST "$API_BASE/tasks" -H "Content-Type: application/json" -d "$TASK_DATA")
TASK_ID=$(echo "$TASK_RESPONSE" | jq -r '.id')
if [ -n "$TASK_ID" ] && [ "$TASK_ID" != "null" ]; then
  echo -e "${GREEN}✅ 任务创建成功, ID: $TASK_ID${NC}"
  echo "$TASK_RESPONSE" | jq '.'
else
  echo -e "${RED}❌ 任务创建失败${NC}"
  echo "$TASK_RESPONSE"
fi
echo ""

# 5. 获取所有任务
test_endpoint "获取所有任务" "GET" "/tasks?projectId=$PROJECT_ID"

# 6. 获取单个任务
if [ -n "$TASK_ID" ] && [ "$TASK_ID" != "null" ]; then
  test_endpoint "获取单个任务" "GET" "/tasks/$TASK_ID"

  # 7. 更新任务
  echo -e "${YELLOW}测试:${NC} 更新任务"
  UPDATE_DATA='{"title":"更新后的任务标题","progress":50}'
  UPDATED_TASK=$(curl -s -X PATCH "$API_BASE/tasks/$TASK_ID" -H "Content-Type: application/json" -d "$UPDATE_DATA")
  if echo "$UPDATED_TASK" | jq -e '.title' > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 任务更新成功${NC}"
    echo "$UPDATED_TASK" | jq '.'
  else
    echo -e "${RED}❌ 任务更新失败${NC}"
    echo "$UPDATED_TASK"
  fi
  echo ""

  # 8. 创建依赖关系
  echo -e "${YELLOW}测试:${NC} 创建依赖关系"
  # 先创建第二个任务
  TASK2_RESPONSE=$(curl -s -X POST "$API_BASE/tasks" -H "Content-Type: application/json" -d "{
    \"title\": \"依赖任务\",
    \"startDate\": \"2026-02-01\",
    \"endDate\": \"2026-02-28\",
    \"level\": \"year\",
    \"status\": \"planned\",
    \"progress\": 0,
    \"type\": \"task\",
    \"dependencies\": [],
    \"projectId\": \"$PROJECT_ID\"
  }")
  TASK2_ID=$(echo "$TASK2_RESPONSE" | jq -r '.id')

  if [ -n "$TASK2_ID" ] && [ "$TASK2_ID" != "null" ]; then
    DEP_DATA=$(cat <<EOF
{
  "fromTaskId": "$TASK_ID",
  "toTaskId": "$TASK2_ID",
  "type": "finish_to_start",
  "lag": 0
}
EOF
)
    DEP_RESPONSE=$(curl -s -X POST "$API_BASE/dependencies" -H "Content-Type: application/json" -d "$DEP_DATA")
    DEP_ID=$(echo "$DEP_RESPONSE" | jq -r '.id')
    if [ -n "$DEP_ID" ] && [ "$DEP_ID" != "null" ]; then
      echo -e "${GREEN}✅ 依赖关系创建成功, ID: $DEP_ID${NC}"
      echo "$DEP_RESPONSE" | jq '.'
    else
      echo -e "${RED}❌ 依赖关系创建失败${NC}"
      echo "$DEP_RESPONSE"
    fi
  fi
  echo ""

  # 9. 删除依赖关系
  if [ -n "$DEP_ID" ] && [ "$DEP_ID" != "null" ]; then
    test_endpoint "删除依赖关系" "DELETE" "/dependencies/$DEP_ID"
  fi

  # 10. 删除任务
  test_endpoint "删除任务" "DELETE" "/tasks/$TASK_ID"
  if [ -n "$TASK2_ID" ] && [ "$TASK2_ID" != "null" ]; then
    test_endpoint "删除任务2" "DELETE" "/tasks/$TASK2_ID"
  fi
fi

# 11. 删除项目
test_endpoint "删除项目" "DELETE" "/projects/$PROJECT_ID"

echo "=========================================="
echo "测试完成"
echo "=========================================="
