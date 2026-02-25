
本产品定名「乾乾」，出自《周易·乾卦》“天行健，君子以自强不息；九三，君子终日乾乾，夕惕若厉，无咎”，和产品“个人AI能力沉淀与跨平台分发中枢”的定位高度契合，并非空泛的文化点缀，而是从精神内核到产品设计的深度呼应：
「乾乾」首先对应产品“持续沉淀、日日精进”的核心逻辑。本产品的本质，就是帮知识工作者把零散在不同AI IDE、随对话流逝的能力闪光点（Prompt、Skill、Agent），转化为可版本管理、可迭代打磨的个人数字资产，解决了优质能力无法持久积累的痛点。用户每一次优化的技能、每一次碰撞出的新思路，都通过乾乾固化到完全属于自己的私有仓库，慢慢构建出专属于个人的AI能力体系，正好呼应了“自强不息”的精神内核，是个人AI能力日日精进的数字化载体。
其次，「乾乾」呼应了产品“行稳可控”的设计原则。「夕惕若厉」所代表的谨惕稳慎，正好对应产品解决跨平台同步痛点的设计思路：为了避免配置混乱、本地私有设置被覆盖，产品设计了冲突分级处理规则、本地覆用语义合并、敏感信息环境隔离、兼容性前置检查等机制，确保所有分发操作都安全可控，既保持全局资产的一致性，也尊重本地环境的差异性，做到行稳不犯错。
最后，「乾」本身“刚健自主”的意涵，契合产品“用户掌控资产”的定位：所有资产存储在用户自己的GitHub仓库，不绑定任何第三方平台，真正做到“一次沉淀，多端可用，用户主权”，完全符合个人开发者自主精进的价值底色。
1. 产品概述 (Product Overview)
核心理念：将 AI 能力（Prompt/Skill/Agent/Flow）视为可版本管理的个人代码资产。
产品定位：一个基于 GitHub 存储、通过 CLI 调度、由 AI 辅助维护的跨平台 AI 资产管理中枢。
解决痛点：解决不同 AI 平台（Cursor, Claude Code, Open Code 等）配置不互通、个人优质 Skill 难以持久化沉淀、多端手动配置繁琐的问题。
2. 核心诉求提炼 (Core Desires)
平台无关性：资产独立于特定 IDE 存在，一次开发，多端可用。
资产化迭代：支持个人 Skill 的持续打磨、版本控制与优胜劣汰。
AI 驱动维护：通过自然语言指令，由 AI 完成复杂的配置文件生成与入库。
主动分发机制：通过 CLI 主动向各平台注入配置，而非被动等待平台调用。
3. 系统功能架构 (Functional Architecture)
A. 资产存储层 (Storage Layer) — 资产的“根”
基于 GitHub Private Repo，采用“协议先行”的存储设计，确保资产的自描述能力。
Skills (原子工具)：
存储形态：文件夹形式，包含 logic.py/js (执行逻辑) 与 manifest.json (功能声明)。
核心属性：定义输入输出参数（Input/Output Schema）、权限需求（如是否需联网）。
Prompts (指令集)：
存储形态：.md 文件。
分层设计：分为 System Prompts (基础人格) 与 Task Prompts (特定任务逻辑)。利用 Markdown Frontmatter 存储版本号和适用场景标签。
Agents (角色与 Purpose)：
存储形态：agent.yaml。
核心内容：依据 OASF 规范 定义 Agent 的 Purpose（核心使命）、Knowledge Base（引用的知识索引）以及 Assigned Skills（关联的技能列表）。
Flows (多 Agent 协作逻辑)：
存储形态：JSON 格式的图结构描述。
协作定义：描述 A-Agent 完工后触发 B-Agent 的条件（基于状态机或 DAG 逻辑），类似于“代码级”的工作流定义。
MCP Configs (远程服务)：
存储形态：环境变量模板与连接配置。
作用：记录远程 MCP Server 的地址与访问凭证（敏感信息采用 .env.template 机制隔离）。
Plugin 封装包规范 (The Package Standard)
在 /skills 和 /agents 之上，引入 /plugins 目录，用于承载复合型能力包（如 oh-my-open-code）。
Plugin 定义：一个 Plugin 是一个包含多个 Agents、Skills、Prompts 以及协作逻辑（Flows）的封装集合。
结构示例 (/plugins/oh-my-open-code/)：
package.json: 定义包名、版本及依赖树（引用了哪些基础 Skill）。
compatibility.yaml: 核心兼容性矩阵，详细列出在各平台（Cursor, Claude Code, Open Code, Cloud Code）的可用性状态。
/manifests: 针对不同平台的差异化描述文件。
B. 调度中心层 (Orchestration Layer - CLI) — 分发的“桥”
作为本地环境与云端仓库的唯一通信通道，负责资产的“翻译”与“注入”。
Pull/Sync 模块 (智能拉取)：
增量同步：基于文件 Hash 值比对，仅同步有变更的资产。
依赖管理：若拉取的 Skill 包含 Python/Node 依赖，同步后自动提示或触发环境安装（acl install-deps）。
Adaptor 模块 (协议转换引擎)：
Cursor Adaptor：将 Prompts 转换为 .cursor/rules/*.mdc；将 Agents 转换为指令集注入。
Open Code / Cloud Code Adaptor：将 Flows 转换为对应的插件配置文件（如 YAML）。
OpenClaw Adaptor：将本地 Skill 映射至 ~/.claw/skills 目录。
Conflict Resolver (冲突与打标处理器)：
继承机制：支持 .aclignore 文件，防止同步时覆盖本地环境的 API Key 或项目特定配置。
打标逻辑：
@sync:full — 完全由云端接管，本地修改会被覆盖。
@sync:merge — 云端更新与本地配置进行语义合并（基于 AI 对比）。
@sync:local — 该文件仅限本地，不参与同步。
调度中心层：增强适配器与兼容性检查器 (Compatibility Guard)
这是处理“跨平台不兼容”问题的核心逻辑。
C. AI 管理入口 (AI-Agentic Manager) — 维护的“手”
利用 AI 能力降低维护成本，实现“对话即维护”。
Market Connector (外部市场转换器)：
跨市场抓取：从 ClawHub 或 Cloud Hub 复制链接，AI 自动解析其 README 或代码逻辑。
标准化重构：将第三方格式转换为 Personal ACL 标准格式，并自动生成对应的 manifest 元数据。
Auto-Doc/Config (自动化维护)：
反向总结：当用户在 IDE 中写出一段高效 Prompt 后，只需唤起 ACL 指令，AI 会自动提取这段 Prompt，生成标准化的文件名、描述及版本号。
自动 Commit：AI 编写符合规范的 Git Commit Message（如 feat(skill): add rust-analyzer-helper via Cursor discussion）并推送到 GitHub。
系统功能架构细化：AI 管理入口 (AI-Agentic Manager)
针对 Plugin 的维护与市场捕获：
Smart Ingester (智能吸纳)：
当用户指令：“Cloud Hub 里的这个 plugin 很好用，帮我存入资产中心”。
AI 不仅保存代码，还会自动分析该 Plugin 的源码，生成兼容性报告。
自动打标：AI 会根据代码中调用的能力（如是否使用了 OS 操作、是否使用了特定平台的 Hook），自动在 compatibility.yaml 中标记各个平台的兼容等级。
4. 基础 MVP 核心能力 (MVP Features)
基础同步：支持通过 CLI 将 GitHub 仓库中的 Prompt 静态同步至 Cursor 的 .mdc 规则和 Open Code 的配置文件。
Metadata 标记系统：实现基础的 scope: global/local 标记，支持非破坏性更新。
核心协议适配：初步适配 MCP 2.0 与 OpenClaw 的 Skill 规范。
一键入库指令：支持通过一段 Prompt 告诉 AI “保存这个 Skill”，AI 输出可提交的 Git 修改。
分发逻辑可以考虑参考 code-yeongyu
oh-my-opencode
5. 用户使用场景细化 (User Scenarios)
场景一：跨平台能力同步 (The "Hot-Swap" of Intelligence)
背景：你在公司的 Cursor 环境中，针对公司特定的 Java 架构规范，迭代出了一套极其精准的“架构评审 Agent”。
动作 A（能力捕获）：在公司电脑输入 acl save --name arch-reviewer --tag java-enterprise。
系统行为：CLI 自动抓取当前项目 .cursor/rules/ 下的相关规则，将其转化为 ACL 标准格式，并推送到 GitHub 私有仓库。
动作 B（跨平台迁移）：回到家，在个人电脑的 Open Code 项目中执行 acl sync --target opencode。
系统行为：CLI 从云端拉取 arch-reviewer 资产。Adaptor 模块检测到目标是 Open Code，自动将 Markdown 格式的指令转换为 Open Code 所需的 YAML 格式 Agent 定义。
结果：你无需手动复制粘贴，两台设备、两个平台之间的“大脑”实现瞬时对齐。
场景二：外部市场资产捕获 (Market-to-Private Capture)
背景：你在 ClawHub 浏览时，发现一个名为 "Deep Refactor" 的 Skill，它在代码解耦方面表现极佳，你想据为己有并适配到 Cloud Code。
动作 A（指令触发）：通过集成了 ACL Manager 的对话界面输入：“Cloud Hub 这个 Skill（附链接）很棒，帮我收录并适配到我的 Cloud Code 环境。”
动作 B（自动化加工）：
Market Connector 访问链接，解析其 SKILL.md 中的工具定义与逻辑说明。
AI 管理入口 对该 Skill 进行安全性审计，并按照个人资产库规范生成元数据，打上 @source:clawhub 标签。
Adaptor 自动生成适配 Cloud Code 插件协议的配置片段。
结果：该 Skill 正式成为你个人资产库的一部分，且已在你的 Cloud Code 本地配置中准备就绪。
场景三：AI 驱动的技能迭代 (Conversation-to-Asset Pipeline)
背景：你与 AI 进行了一场关于“前端性能优化”的长对话，期间共同碰撞出一套包含 Web Vitals 监控、代码拆分策略和缓存机制的综合 Prompt 逻辑。
动作 A（语义提取）：对话结束时，你指令 AI：“总结刚才关于性能优化的所有洞察，沉淀为一个名为‘Frontend-Performance-Expert’的 Skill。”
动作 B（结构化入库）：
AI 自动过滤掉对话中的废话，将核心逻辑抽象为 README.md (说明)、instruction.md (核心指令) 和 examples.md (示例数据)。
AI 自动编写 Git 修改说明：“Update: Initial version of frontend performance optimization skill derived from session #1024”。
结果：原本随对话流逝的闪光点被固化为可调用的插件资产，存储在 GitHub 中供后续所有项目调用。
场景四：特定项目的“精细化调优”
场景补充：冲突处理与局部覆写 (Local Overriding)
为了解决您之前提到的“本地特有配置不应被覆盖”的需求，增加一个特定场景：
背景：你的“前端专家”Skill 是全局通用的，但在某个特定项目中，你需要它额外关注 Tailwind CSS 的规范。
操作：在项目根目录的 .acl/overrides/frontend-expert.md 中写入针对 Tailwind 的特殊要求。
执行同步：运行 acl sync。
Conflict Resolver 逻辑：
从云端拉取全局“前端专家”逻辑。
识别到当前项目存在同名 Override 文件。
分发策略：CLI 将全局逻辑与本地 Override 逻辑进行语义叠加（Merge），生成该项目专属的临时 .mdc 或配置文件。
结果：既保持了全局能力的一致性，又完美适配了项目差异化需求，且本地的特殊配置不会被云端更新抹除。
细化用户使用场景：Plugin 集成与兼容反馈
场景五：复合插件包的跨平台分发
背景：你维护了一个 ACL-Full-Stack-Plugin，内部集成了前端、后端和运维三个 Agent。
动作：你在一个纯 Web 开发的项目（环境：Cloud Code）中尝试同步该 Plugin。
系统反馈：
CLI 检查发现：前端 Agent (兼容)、后端 Agent (兼容)、运维 Agent (依赖本地 Docker，Cloud Code 无法提供)。
终端输出：
"检测到当前环境为 Cloud Code。 [✓] 已同步 前端 Agent、后端 Agent。 [!] 警告：运维 Agent 涉及本地宿主机操作，与当前环境不兼容，已跳过。 [i] 如需完整功能，请在 Open Code 或具备本地权限的环境下运行。"
6. 技术调研与待明确细节清单 (Research & Detail List)
协议标准类
OASF (Open Agentic Schema Framework) 的元数据兼容性调研。
A2A (Agent-to-Agent) 协议中 Purpose 传递的标准化字段映射。
平台适配类
Cursor .mdc 文件对多 Agent 协作定义的承载上限。
Cloud Code 与 Open Code 的插件热加载机制（静态同步后是否需重启）。
OpenClaw 对外部动态挂载 Skill 目录的支持程度。
工程实现类
基于 Git 钩子的自动冲突合并策略（针对 Local Override）。
不同平台间 Skill 依赖项（如 Python 库或 Node 环境）的自动化检查方案。
plugin
Plugin 依赖解耦：如何处理 Plugin 内部的“硬编码”平台逻辑？（例如：将平台私有 API 抽象为虚拟接口）。
版本兼容性降级：当云端 Plugin 版本过高，而本地 IDE 插件版本较低时，如何实现平滑降级同步？
状态同步协议：不同平台的 Plugin 如果共用一个远程 MCP，如何同步它们之间的 Session 状态？
