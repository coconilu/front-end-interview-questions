/**
 * 207. 课程表
 * 
 * 你这个学期必须选修 numCourses 门课程，记为 0 到 numCourses-1 。
 * 在选修某些课程之前需要一些先修课程。先修课程按数组 prerequisites 给出，其中 prerequisites[i] = [ai, bi] ，表示如果要学习课程 ai 则 必须 先学习课程 bi 。
 * 
 * 例如，先修课程对 [0, 1] 表示：想要学习课程 0 ，你需要先完成课程 1 。
 * 请你判断是否可能完成所有课程的学习？如果可以，返回 true ；否则，返回 false 。
 * 
 * 示例 1：
 * 输入：numCourses = 2, prerequisites = [[1,0]]
 * 输出：true
 * 解释：总共有 2 门课程。学习课程 1 之前，你需要完成课程 0 。这是可能的。
 * 
 * 示例 2：
 * 输入：numCourses = 2, prerequisites = [[1,0],[0,1]]
 * 输出：false
 * 解释：总共有 2 门课程。学习课程 1 之前，你需要先完成课程 0 ；并且学习课程 0 之前，你还应先完成课程 1 。这是不可能的。
 */

/**
 * DFS 检测环解法
 * @param {number} numCourses
 * @param {number[][]} prerequisites
 * @return {boolean}
 */
var canFinish = function(numCourses, prerequisites) {
    // 构建邻接表表示图
    const graph = Array(numCourses).fill().map(() => []);
    for (const [course, prereq] of prerequisites) {
        graph[course].push(prereq);
    }
    
    // 0: 未访问, 1: 访问中, 2: 已完成访问
    const visited = new Array(numCourses).fill(0);
    
    // 检查是否有环
    function hasCycle(course) {
        // 如果正在访问中，说明找到了环
        if (visited[course] === 1) return true;
        // 如果已经完成访问，无需重复访问
        if (visited[course] === 2) return false;
        
        // 标记为访问中
        visited[course] = 1;
        
        // 访问所有相邻节点
        for (const prereq of graph[course]) {
            if (hasCycle(prereq)) {
                return true;
            }
        }
        
        // 标记为已完成访问
        visited[course] = 2;
        return false;
    }
    
    // 对每个未访问的节点进行DFS
    for (let i = 0; i < numCourses; i++) {
        if (hasCycle(i)) {
            return false;
        }
    }
    
    return true;
};

/**
 * BFS 拓扑排序解法
 * @param {number} numCourses
 * @param {number[][]} prerequisites
 * @return {boolean}
 */
var canFinishBFS = function(numCourses, prerequisites) {
    // 构建邻接表和入度数组
    const graph = Array(numCourses).fill().map(() => []);
    const inDegree = new Array(numCourses).fill(0);
    
    for (const [course, prereq] of prerequisites) {
        graph[prereq].push(course); // 先修课指向后修课
        inDegree[course]++; // 增加后修课的入度
    }
    
    // 将所有入度为0的节点加入队列
    const queue = [];
    for (let i = 0; i < numCourses; i++) {
        if (inDegree[i] === 0) {
            queue.push(i);
        }
    }
    
    let count = 0; // 已访问的节点数
    
    while (queue.length > 0) {
        const course = queue.shift();
        count++;
        
        // 减少相邻节点的入度
        for (const nextCourse of graph[course]) {
            inDegree[nextCourse]--;
            
            // 如果入度变为0，加入队列
            if (inDegree[nextCourse] === 0) {
                queue.push(nextCourse);
            }
        }
    }
    
    // 如果访问的节点数等于总节点数，说明可以完成所有课程
    return count === numCourses;
}; 