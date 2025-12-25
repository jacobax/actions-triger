export default {
  async scheduled(event, env, ctx) {
    // 1. 定义需要触发的任务列表
    // 你可以直接写在代码里，也可以从环境变量 ENV_WORKFLOW_CONFIG 读取 JSON 字符串
    const tasks = [
      { owner: "org-name",  repo: "project-x", workflow_id: "deploy.yml", ref: "dev" },
    ];

    const GITHUB_TOKEN = env.GITHUB_TOKEN;

    // 2. 并行处理所有请求
    const results = await Promise.allSettled(
      tasks.map(task => triggerWorkflow(task, GITHUB_TOKEN))
    );

    // 3. 日志记录结果
    results.forEach((result, index) => {
      const task = tasks[index];
      if (result.status === "fulfilled") {
        console.log(`成功: ${task.owner}/${task.repo} - ${task.workflow_id}`);
      } else {
        console.error(`失败: ${task.owner}/${task.repo} - 原因: ${result.reason}`);
      }
    });
  },

  // 支持手动 HTTP 触发测试
  async fetch(request, env, ctx) {
    await this.scheduled(null, env, ctx);
    return new Response("多任务触发指令已发送，请检查控制台日志。");
  }
};

/**
 * 封装触发单个 Workflow 的函数
 */
async function triggerWorkflow(task, token) {
  const { owner, repo, workflow_id, ref } = task;
  const url = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflow_id}/dispatches`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/vnd.github+json",
      "User-Agent": "CF-Worker-Multi-Trigger",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify({
      ref: ref,
      inputs: {} // 如果有参数，可以在 task 对象里定义并传递到这里
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HTTP ${response.status}: ${error}`);
  }
  return true;
}
