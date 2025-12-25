# actions-triger
**cf workers 触发 actions 工作流，免排队**  
* 支持多仓库
* 两次触发间隔锁定大于60分钟（可自行调节代码）
---
## 用法
1. 创建 cf worker，名随便如 actions-triger
2. 创建 KV 空间，名随便如 `TRIGGER_LOCK`
3. 绑定 KV 空间，变量名须为 `TRIGGER_KV`，选择前面创建的空间名
4. 添加环境变量 `GITHUB_TOKEN`，TOKEN 须有 **REPO**、**workflows** 权限
5. 选择一种代码，填写仓库（及目标链接）信息，部署
6. 验证：访问 worker 链接触发 worker 运行，查看可观测事件日志

