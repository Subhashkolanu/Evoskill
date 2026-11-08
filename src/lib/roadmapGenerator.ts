import { OnboardingAnswers, RoadmapData } from '../types';

/**
 * Domain-Intelligent Curriculum Generator
 * Synthesizes personalized First-Principles roadmaps tailored specifically to the user's
 * chosen domain, target role, daily commitment, existing skills, and learning style.
 */
export function generateDomainRoadmap(answers: OnboardingAnswers): RoadmapData {
  const { 
    fieldOfInterest, 
    primaryGoal, 
    currentLevel, 
    existingSkills, 
    targetRole, 
    hoursPerDay, 
    learningStyle, 
    targetTimelineMonths 
  } = answers;

  const roleTitle = targetRole.trim() || getDefaultRoleForField(fieldOfInterest);
  const detectedStrengths = existingSkills.length > 0 
    ? [...existingSkills.slice(0, 3), "Systematic Growth"]
    : ["First-Principles Reasoning", "Growth Mindset", "Consistency"];

  const isJuniorOrStudent = primaryGoal.toLowerCase().includes('first') || 
                           primaryGoal.toLowerCase().includes('intern') || 
                           currentLevel === 'Absolute Beginner';

  // Dynamic salary benchmark based on goal & level
  const salaryRange = isJuniorOrStudent 
    ? "$75,000 - $98,000 (Entry / Associate)"
    : currentLevel === 'Advanced' 
      ? "$145,000 - $190,000 (Senior / Lead)"
      : "$105,000 - $140,000 (Mid-Level)";

  // Generate curriculum specific to field
  if (fieldOfInterest.includes("AI") || fieldOfInterest.includes("Machine Learning")) {
    return buildAIMLRoadmap(roleTitle, primaryGoal, detectedStrengths, salaryRange, hoursPerDay, learningStyle, targetTimelineMonths, existingSkills);
  } else if (fieldOfInterest.includes("Cyber") || fieldOfInterest.includes("Security")) {
    return buildCyberRoadmap(roleTitle, primaryGoal, detectedStrengths, salaryRange, hoursPerDay, learningStyle, targetTimelineMonths, existingSkills);
  } else if (fieldOfInterest.includes("Cloud") || fieldOfInterest.includes("DevOps")) {
    return buildCloudDevOpsRoadmap(roleTitle, primaryGoal, detectedStrengths, salaryRange, hoursPerDay, learningStyle, targetTimelineMonths, existingSkills);
  } else if (fieldOfInterest.includes("Data Analytics") || fieldOfInterest.includes("Intelligence")) {
    return buildDataAnalyticsRoadmap(roleTitle, primaryGoal, detectedStrengths, salaryRange, hoursPerDay, learningStyle, targetTimelineMonths, existingSkills);
  } else if (fieldOfInterest.includes("Competitive Programming") || fieldOfInterest.includes("Structures")) {
    return buildAlgorithmsRoadmap(roleTitle, primaryGoal, detectedStrengths, salaryRange, hoursPerDay, learningStyle, targetTimelineMonths, existingSkills);
  } else {
    // Default to Full-Stack / Software Engineering
    return buildFullStackRoadmap(roleTitle, primaryGoal, detectedStrengths, salaryRange, hoursPerDay, learningStyle, targetTimelineMonths, existingSkills);
  }
}

function getDefaultRoleForField(field: string): string {
  if (field.includes("AI")) return "Applied Machine Learning Engineer";
  if (field.includes("Cyber")) return "Information Security & Penetration Analyst";
  if (field.includes("Cloud")) return "Cloud DevOps & Platform Engineer";
  if (field.includes("Data")) return "Data Analytics & BI Engineer";
  if (field.includes("Competitive")) return "Algorithms & Systems Specialist";
  return "Full-Stack Software Engineer";
}

function buildAIMLRoadmap(
  role: string, goal: string, strengths: string[], salary: string,
  hours: number, style: string, months: number, skills: string[]
): RoadmapData {
  return {
    user_profile_analysis: {
      detected_strengths: strengths,
      best_career_path: role,
      why_this_path_suits_them: `Your goal to "${goal}" combined with a ${months}-month horizon matches an applied AI/ML path. We focus on mathematical intuitions and deploying production models rather than passive textbook reading.`
    },
    market_analysis: {
      average_salary_range: salary,
      demand_level: "Exceptional (Top 5% Growth)",
      key_companies: ["Anthropic", "Google DeepMind", "OpenAI", "Scale AI", "Enterprise AI Labs"]
    },
    micro_steps_roadmap: [
      {
        phase_name: "Phase 1: Mathematical Foundations & Tensor Primitives",
        goal: "Master vector math, matrix transformations, and gradient descent from scratch without PyTorch autograd.",
        daily_breakdown: [
          {
            title: "Day 1–3: Vectors, Matrices & NumPy Broadcasting",
            description: "Build a pure NumPy matrix engine. Implement dot products, transpose operations, and broadcast rules without higher-level libraries.",
            estimated_duration_hours: hours,
            resource_links: [
              { title: "3Blue1Brown Linear Algebra Series", url: "https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab" },
              { title: "NumPy Array Programming Guide", url: "https://numpy.org/doc/stable/user/absolute_beginners.html" }
            ],
            deadline_approaching: true
          },
          {
            title: "Day 4–7: Micrograd — Automatic Differentiation Engine",
            description: "Implement a Scalar value class that builds a DAG of operations and performs backpropagation via the chain rule.",
            estimated_duration_hours: hours,
            resource_links: [
              { title: "Andrej Karpathy's Micrograd Repository", url: "https://github.com/karpathy/micrograd" }
            ]
          }
        ]
      },
      {
        phase_name: "Phase 2: Deep Neural Networks & Transformer Mechanics",
        goal: "Train classification models, fine-tune open-weights LLMs, and structure evaluation metrics.",
        daily_breakdown: [
          {
            title: "Day 8–12: PyTorch Model Training & Loss Landscapes",
            description: "Train a Convolutional Neural Network on CIFAR-10 with Adam optimizer, cosine learning rate scheduling, and data augmentation.",
            estimated_duration_hours: hours,
            resource_links: [
              { title: "Official PyTorch Tutorials", url: "https://pytorch.org/tutorials/" }
            ]
          },
          {
            title: "Day 13–18: Attention Mechanisms & Transformer Attention Heads",
            description: "Build multi-head scaled dot-product attention from scratch. Verify query, key, value matrix multiplications and softmax masking.",
            estimated_duration_hours: hours,
            resource_links: [
              { title: "The Illustrated Transformer (Jay Alammar)", url: "https://jalammar.github.io/illustrated-transformer/" }
            ]
          }
        ]
      },
      {
        phase_name: "Phase 3: Production Model Serving & LLM Orchestration",
        goal: "Deploy models via low-latency FastAPI endpoints with quantization, caching, and evaluation telemetry.",
        daily_breakdown: [
          {
            title: "Day 19–24: Low-Latency Inference Pipeline with vLLM / ONNX",
            description: "Convert models to ONNX runtime format. Implement dynamic batching and token streaming over WebSocket endpoints.",
            estimated_duration_hours: hours,
            resource_links: [
              { title: "vLLM High-Throughput Serving Engine", url: "https://docs.vllm.ai/" }
            ]
          }
        ]
      }
    ],
    real_world_projects: [
      {
        project_name: "Self-Hosted Retrieval-Augmented Generation (RAG) Engine",
        what_you_will_build: "An end-to-end document intelligence engine with hybrid semantic vector search, reranking, and hallucination guardrails.",
        skills_gained: ["Vector Embeddings", "Qdrant / Milvus", "FastAPI", "Prompt Optimization"]
      },
      {
        project_name: "Multi-Modal Vision Classifier with Real-Time Inference",
        what_you_will_build: "A containerized real-time computer vision service with TensorRT acceleration and automated drift monitoring.",
        skills_gained: ["PyTorch", "Docker", "Model Quantization", "Prometheus Metrics"]
      }
    ],
    resource_aggregator: [
      { resource_type: "Interactive Course", topic: "Practical Deep Learning for Coders", direct_url: "https://course.fast.ai/" },
      { resource_type: "Canonical Book", topic: "Deep Learning (Goodfellow, Bengio)", direct_url: "https://www.deeplearningbook.org/" },
      { resource_type: "Official Docs", topic: "PyTorch Documentation", direct_url: "https://pytorch.org/docs/" }
    ],
    coach_motivation_message: "Do not treat machine learning as a black box. Understanding gradients and tensors at the metal level will make you 10x more effective than prompt-only engineers."
  };
}

function buildCyberRoadmap(
  role: string, goal: string, strengths: string[], salary: string,
  hours: number, style: string, months: number, skills: string[]
): RoadmapData {
  return {
    user_profile_analysis: {
      detected_strengths: strengths,
      best_career_path: role,
      why_this_path_suits_them: `Targeting "${role}" requires an adversarial mindset and deep knowledge of protocols. Your daily ${hours}h commitment is directed into hands-on lab exploits and defensive mitigation.`
    },
    market_analysis: {
      average_salary_range: salary,
      demand_level: "Critical (Zero Unemployment Rate)",
      key_companies: ["CrowdStrike", "Mandiant / Google Cloud", "Palo Alto Networks", "Cloudflare", "Fintech Defense"]
    },
    micro_steps_roadmap: [
      {
        phase_name: "Phase 1: Systems Internals, Linux & Network Protocol Analysis",
        goal: "Dissect TCP/IP handshakes, packet headers, memory layouts, and permission models.",
        daily_breakdown: [
          {
            title: "Day 1–3: Packet Dissection with Wireshark & tcpdump",
            description: "Capture and analyze DNS queries, TLS 1.3 handshakes, and TCP SYN-ACK sequences. Identify unencrypted traffic and anomalous payloads.",
            estimated_duration_hours: hours,
            resource_links: [
              { title: "Wireshark User Guide & PCAP Analysis", url: "https://www.wireshark.org/docs/" }
            ],
            deadline_approaching: true
          },
          {
            title: "Day 4–7: Linux Privilege Models & Bash Scripting",
            description: "Audit SUID binaries, cron privilege escalations, and Linux namespace isolation. Build automated recon scripts.",
            estimated_duration_hours: hours,
            resource_links: [
              { title: "OverTheWire Bandit Wargame", url: "https://overthewire.org/wargames/bandit/" }
            ]
          }
        ]
      },
      {
        phase_name: "Phase 2: Web Application Security & OWASP Top 10",
        goal: "Identify, exploit, and remediate critical web application flaws in sandboxed lab environments.",
        daily_breakdown: [
          {
            title: "Day 8–13: Authentication Bypasses & SQL Injection",
            description: "Practice error-based, union-based, and blind SQL injections in PortSwigger Web Security Academy labs. Implement parameterized queries to remediate.",
            estimated_duration_hours: hours,
            resource_links: [
              { title: "PortSwigger Web Security Academy", url: "https://portswigger.net/web-security" }
            ]
          },
          {
            title: "Day 14–18: Cross-Site Scripting (XSS) & CSRF Tokens",
            description: "Craft reflected and stored XSS payloads to test CSP headers. Implement strict SameSite cookies and cryptographic anti-CSRF tokens.",
            estimated_duration_hours: hours,
            resource_links: [
              { title: "OWASP Top Ten Security Guide", url: "https://owasp.org/www-project-top-ten/" }
            ]
          }
        ]
      },
      {
        phase_name: "Phase 3: Defensive Telemetry, SIEM & Incident Response",
        goal: "Deploy intrusion detection systems, configure audit logs, and conduct root-cause threat triage.",
        daily_breakdown: [
          {
            title: "Day 19–24: Log Telemetry Analysis with Suricata & Splunk",
            description: "Configure network IDS rules with Suricata to detect suspicious port scans and brute force attacks. Write Splunk alert queries for lateral movement.",
            estimated_duration_hours: hours,
            resource_links: [
              { title: "Suricata IDS Documentation", url: "https://suricata.io/documentation/" }
            ]
          }
        ]
      }
    ],
    real_world_projects: [
      {
        project_name: "Automated Web Vulnerability & Header Scanner",
        what_you_will_build: "A Python CLI scanner that crawls endpoints, evaluates CORS policies, checks CSP directives, and generates structured executive HTML reports.",
        skills_gained: ["Python", "HTTP Headers", "Security Auditing", "JSON/HTML Reporting"]
      },
      {
        project_name: "Honeypot Decoy Service with Alert Pipeline",
        what_you_will_build: "An isolated SSH/FTP decoy container that captures attacker keystrokes, logs source IPs, and pushes webhook alerts to Discord/Slack.",
        skills_gained: ["Docker", "Linux Auditd", "Intrusion Detection", "Threat Intelligence"]
      }
    ],
    resource_aggregator: [
      { resource_type: "Interactive Labs", topic: "PortSwigger Web Security Academy", direct_url: "https://portswigger.net/web-security" },
      { resource_type: "Canonical Guide", topic: "OWASP Testing Guide (WSTG)", direct_url: "https://owasp.org/www-project-web-security-testing-guide/" },
      { resource_type: "Practice Arena", topic: "OverTheWire Wargames", direct_url: "https://overthewire.org/" }
    ],
    coach_motivation_message: "Security is not about memorizing attack vectors; it is about knowing how protocols work better than the people who implemented them. Stay ethical, stay thorough."
  };
}

function buildCloudDevOpsRoadmap(
  role: string, goal: string, strengths: string[], salary: string,
  hours: number, style: string, months: number, skills: string[]
): RoadmapData {
  return {
    user_profile_analysis: {
      detected_strengths: strengths,
      best_career_path: role,
      why_this_path_suits_them: `Targeting "${role}" requires mastering infrastructure as code, container runtimes, and resilient CI/CD pipelines. This plan focuses on high-availability cloud architecture.`
    },
    market_analysis: {
      average_salary_range: salary,
      demand_level: "Very High",
      key_companies: ["Amazon Web Services", "Microsoft Azure", "HashiCorp", "Datadog", "Scale-ups"]
    },
    micro_steps_roadmap: [
      {
        phase_name: "Phase 1: Linux Internals, Shell Automation & Containerization",
        goal: "Master process namespaces, cgroups, multi-stage Docker builds, and microservices networking.",
        daily_breakdown: [
          {
            title: "Day 1–3: Linux Namespaces & Minimal Container Runtimes",
            description: "Explore chroot, pivot_root, cgroups, and network namespaces. Write a multi-stage Dockerfile optimizing image layers to under 30MB.",
            estimated_duration_hours: hours,
            resource_links: [
              { title: "Docker Best Practices Guide", url: "https://docs.docker.com/develop/develop-images/dockerfile_best-practices/" }
            ],
            deadline_approaching: true
          },
          {
            title: "Day 4–7: Docker Compose Microservices & Reverse Proxies",
            description: "Orchestrate a multi-container stack with Nginx reverse proxy, Node.js API, and PostgreSQL with persistent volumes and healthchecks.",
            estimated_duration_hours: hours,
            resource_links: [
              { title: "Nginx Architecture & Reverse Proxy Guide", url: "https://nginx.org/en/docs/" }
            ]
          }
        ]
      },
      {
        phase_name: "Phase 2: Infrastructure as Code (Terraform) & Automated CI/CD",
        goal: "Provision reproducible cloud infrastructure with Terraform and build automated GitHub Actions pipelines.",
        daily_breakdown: [
          {
            title: "Day 8–13: Declarative Cloud Provisioning with Terraform",
            description: "Write modular Terraform code for VPCs, subnets, route tables, security groups, and auto-scaling compute groups. Manage remote state safely.",
            estimated_duration_hours: hours,
            resource_links: [
              { title: "HashiCorp Terraform Tutorials", url: "https://developer.hashicorp.com/terraform/tutorials" }
            ]
          },
          {
            title: "Day 14–18: GitHub Actions CI/CD Pipeline with Automated Staging",
            description: "Implement linting, test suites, Docker image caching, and automated zero-downtime deployment triggers on pull request merges.",
            estimated_duration_hours: hours,
            resource_links: [
              { title: "GitHub Actions Workflow Syntax", url: "https://docs.github.com/en/actions" }
            ]
          }
        ]
      },
      {
        phase_name: "Phase 3: Kubernetes Orchestration & Telemetry Observability",
        goal: "Deploy self-healing applications on Kubernetes with Prometheus metrics and Grafana dashboards.",
        daily_breakdown: [
          {
            title: "Day 19–24: Kubernetes Deployments, Services & Ingress Controllers",
            description: "Write manifests for Deployments, ConfigMaps, Secrets, ClusterIP services, and Ingress routing with rolling update strategies.",
            estimated_duration_hours: hours,
            resource_links: [
              { title: "Kubernetes The Hard Way (Kelsey Hightower)", url: "https://github.com/kelseyhightower/kubernetes-the-hard-way" }
            ]
          }
        ]
      }
    ],
    real_world_projects: [
      {
        project_name: "Multi-Region Cloud Infrastructure with Terraform",
        what_you_will_build: "A fully reproducible cloud architecture with VPC peering, Bastion host, private DB subnet, and SSL automated provisioning.",
        skills_gained: ["Terraform", "AWS/Cloud Architecture", "Networking", "IAM Security"]
      },
      {
        project_name: "Production GitOps Delivery Pipeline with ArgoCD",
        what_you_will_build: "A GitOps deployment workflow synchronizing Git commits to a live Kubernetes cluster with canary traffic shifting and rollback.",
        skills_gained: ["Kubernetes", "ArgoCD", "Helm", "Prometheus Metrics"]
      }
    ],
    resource_aggregator: [
      { resource_type: "Documentation", topic: "The Twelve-Factor App Methodology", direct_url: "https://12factor.net/" },
      { resource_type: "Canonical Guide", topic: "Google Site Reliability Engineering (SRE)", direct_url: "https://sre.google/sre-book/table-of-contents/" },
      { resource_type: "Hands-on Lab", topic: "Kubernetes Tutorials", direct_url: "https://kubernetes.io/docs/tutorials/" }
    ],
    coach_motivation_message: "Automate everything that can be done twice. Build your cloud systems so that a server failure at 3 AM resolves itself without waking you up."
  };
}

function buildDataAnalyticsRoadmap(
  role: string, goal: string, strengths: string[], salary: string,
  hours: number, style: string, months: number, skills: string[]
): RoadmapData {
  return {
    user_profile_analysis: {
      detected_strengths: strengths,
      best_career_path: role,
      why_this_path_suits_them: `Your goal to "${goal}" benefits from turning messy raw datasets into actionable executive intelligence. This curriculum emphasizes advanced SQL, Python data pipelines, and storytelling dashboards.`
    },
    market_analysis: {
      average_salary_range: salary,
      demand_level: "High",
      key_companies: ["Snowflake", "Capital One", "McKinsey Digital", "E-Commerce Leaders", "Fintech"]
    },
    micro_steps_roadmap: [
      {
        phase_name: "Phase 1: Advanced Relational SQL & Data Modeling",
        goal: "Master window functions, CTEs, indexing, and dimensional schema modeling (Star & Snowflake schemas).",
        daily_breakdown: [
          {
            title: "Day 1–3: Window Functions & Analytical Aggregations",
            description: "Write queries using ROW_NUMBER(), RANK(), DENSE_RANK(), LEAD/LAG, and running totals over partitioned windows.",
            estimated_duration_hours: hours,
            resource_links: [
              { title: "Mode Analytics SQL Tutorial for Data Analysis", url: "https://mode.com/sql-tutorial/" }
            ],
            deadline_approaching: true
          },
          {
            title: "Day 4–7: Dimensional Modeling & Fact Table Design",
            description: "Design an analytics schema for an e-commerce platform with slowly changing dimensions (SCD Type 2) and fact tables.",
            estimated_duration_hours: hours,
            resource_links: [
              { title: "The Data Warehouse Toolkit (Kimball)", url: "https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/" }
            ]
          }
        ]
      },
      {
        phase_name: "Phase 2: Python Data Cleaning, Transformation & Exploratory Analysis",
        goal: "Harness Pandas and Polars to automate data wrangling, handle outliers, and perform statistical hypothesis testing.",
        daily_breakdown: [
          {
            title: "Day 8–13: High-Performance Data Wrangling with Pandas",
            description: "Clean a 1M-row transaction dataset. Impute missing values, normalize timestamps, and perform vectorized group-by transformations.",
            estimated_duration_hours: hours,
            resource_links: [
              { title: "Pandas Documentation & Cookbooks", url: "https://pandas.pydata.org/docs/" }
            ]
          }
        ]
      },
      {
        phase_name: "Phase 3: Executive BI Dashboards & Data Storytelling",
        goal: "Build interactive executive dashboards in Tableau / Power BI with drill-down KPIs and automated reporting.",
        daily_breakdown: [
          {
            title: "Day 14–18: Interactive KPI Dashboard & Cohort Retention",
            description: "Construct a customer lifetime value (LTV) and cohort retention matrix with interactive filters and executive summary cards.",
            estimated_duration_hours: hours,
            resource_links: [
              { title: "Storytelling with Data (Cole Nussbaumer)", url: "https://www.storytellingwithdata.com/" }
            ]
          }
        ]
      }
    ],
    real_world_projects: [
      {
        project_name: "E-Commerce Customer Retention & Churn Engine",
        what_you_will_build: "An end-to-end data pipeline calculating cohort retention, churn hazard rates, and predictive RFM segmentation.",
        skills_gained: ["PostgreSQL Window Functions", "Pandas", "Statistical Modeling", "Power BI / Tableau"]
      },
      {
        project_name: "Real-Time Stock Market Telemetry Dashboard",
        what_you_will_build: "An automated analytics dashboard fetching live financial API feeds and visualizing volatility trends with alert triggers.",
        skills_gained: ["API Ingestion", "Time-Series Analysis", "Streamlit / Dash", "Data Visualization"]
      }
    ],
    resource_aggregator: [
      { resource_type: "Canonical Guide", topic: "Mode Analytics SQL Handbook", direct_url: "https://mode.com/sql-tutorial/" },
      { resource_type: "Interactive Tool", topic: "Tableau Public Gallery", direct_url: "https://public.tableau.com/app/discover" },
      { resource_type: "Book", topic: "Python for Data Analysis (Wes McKinney)", direct_url: "https://wesmckinney.com/book/" }
    ],
    coach_motivation_message: "Data by itself is just noise. The value of an analyst is turning numbers into decisive business decisions. Always ask: 'What action does this chart inspire?'"
  };
}

function buildAlgorithmsRoadmap(
  role: string, goal: string, strengths: string[], salary: string,
  hours: number, style: string, months: number, skills: string[]
): RoadmapData {
  return {
    user_profile_analysis: {
      detected_strengths: strengths,
      best_career_path: role,
      why_this_path_suits_them: `Your goal to "${goal}" requires rigorous algorithmic intuition and asymptotic efficiency. This curriculum builds deep pattern recognition across 15 canonical data structure archetypes.`
    },
    market_analysis: {
      average_salary_range: salary,
      demand_level: "High (Top Tier Tech)",
      key_companies: ["Jane Street", "Citadel", "Google", "Meta", "High-Frequency Trading"]
    },
    micro_steps_roadmap: [
      {
        phase_name: "Phase 1: Asymptotic Complexity & Linear Data Structures",
        goal: "Master Big-O space/time proofs, pointers, linked lists, monotonic stacks, and sliding windows.",
        daily_breakdown: [
          {
            title: "Day 1–3: Two Pointers & Variable-Length Sliding Windows",
            description: "Solve 8 canonical sliding window problems. Prove linear O(N) runtime and invariant conditions without auxiliary space.",
            estimated_duration_hours: hours,
            resource_links: [
              { title: "NeetCode Roadmap & Patterns", url: "https://neetcode.io/roadmap" }
            ],
            deadline_approaching: true
          },
          {
            title: "Day 4–7: Monotonic Stacks & Queues",
            description: "Implement next greater element and largest rectangle in histogram using monotonic stack techniques in O(N).",
            estimated_duration_hours: hours,
            resource_links: [
              { title: "CP-Algorithms Monotonic Stack", url: "https://cp-algorithms.com/" }
            ]
          }
        ]
      },
      {
        phase_name: "Phase 2: Non-Linear Structures: Trees, Heaps & Graphs",
        goal: "Master recursive traversals, Dijkstra, topological sort, Union-Find, and Trie prefix trees.",
        daily_breakdown: [
          {
            title: "Day 8–13: Graph BFS, DFS & Topological Sort (Kahn's Algorithm)",
            description: "Detect cycles in directed and undirected graphs. Build task dependency resolution engines using Kahn's topological sort.",
            estimated_duration_hours: hours,
            resource_links: [
              { title: "MIT 6.006: Introduction to Algorithms (Graph Theory)", url: "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/" }
            ]
          }
        ]
      },
      {
        phase_name: "Phase 3: Dynamic Programming & Bitmask Optimization",
        goal: "Formulate recurrence relations, identify optimal substructure, and eliminate recursive subproblems with memoization and tabulation.",
        daily_breakdown: [
          {
            title: "Day 14–18: 1D & 2D Dynamic Programming (Knapsack, LCS)",
            description: "Solve 0/1 Knapsack, Longest Common Subsequence, and Edit Distance. Optimize 2D matrix storage into 1D rolling array states.",
            estimated_duration_hours: hours,
            resource_links: [
              { title: "Dynamic Programming Patterns Guide", url: "https://leetcode.com/discuss/general-discussion/458695/Dynamic-Programming-Patterns" }
            ]
          }
        ]
      }
    ],
    real_world_projects: [
      {
        project_name: "High-Performance In-Memory LRU/LFU Cache with O(1) Operations",
        what_you_will_build: "An optimized double-ended linked list + hash map cache implementing concurrent eviction policies and benchmark tests.",
        skills_gained: ["Data Structures", "Memory Management", "Concurrency Locks", "Benchmark Profiling"]
      },
      {
        project_name: "Route Planning & Shortest Path Engine with A* Search",
        what_you_will_build: "A graph visualization application computing shortest geographic paths using priority queues and heuristic distance metrics.",
        skills_gained: ["Priority Queues", "Dijkstra / A* Algorithm", "Spatial Data", "TypeScript"]
      }
    ],
    resource_aggregator: [
      { resource_type: "Interactive Problem Set", topic: "NeetCode 150 Practice Guide", direct_url: "https://neetcode.io/practice" },
      { resource_type: "Canonical Textbook", topic: "Introduction to Algorithms (CLRS)", direct_url: "https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/" },
      { resource_type: "Reference", topic: "CP-Algorithms (Algorithms & Data Structures)", direct_url: "https://cp-algorithms.com/" }
    ],
    coach_motivation_message: "Algorithmic thinking is not about memorizing solutions; it is about recognizing fundamental invariant patterns. Break every complex problem into its simplest recursive sub-case."
  };
}

function buildFullStackRoadmap(
  role: string, goal: string, strengths: string[], salary: string,
  hours: number, style: string, months: number, skills: string[]
): RoadmapData {
  return {
    user_profile_analysis: {
      detected_strengths: strengths,
      best_career_path: role,
      why_this_path_suits_them: `Your goal to "${goal}" combined with a ${months}-month target suits a modern Full-Stack Software Engineering path. You will build end-to-end applications from database schemas to reactive interfaces.`
    },
    market_analysis: {
      average_salary_range: salary,
      demand_level: "Very High",
      key_companies: ["Stripe", "Vercel", "Airbnb", "Shopify", "High-Growth Scaleups"]
    },
    micro_steps_roadmap: [
      {
        phase_name: "Phase 1: Modern TypeScript & Clean Architectural Patterns",
        goal: "Master strongly typed frontend development, state management, and component lifecycles.",
        daily_breakdown: [
          {
            title: "Day 1–3: Advanced TypeScript Types, Generics & Discriminated Unions",
            description: "Build strongly-typed utility types. Model complex state machines using discriminated unions and type narrowing.",
            estimated_duration_hours: hours,
            resource_links: [
              { title: "TypeScript Official Handbook", url: "https://www.typescriptlang.org/docs/handbook/intro.html" }
            ],
            deadline_approaching: true
          },
          {
            title: "Day 4–7: React Component Architecture & Custom Hooks",
            description: "Build reusable UI primitives with accessible keyboard navigation, compound components, and memoized state handlers.",
            estimated_duration_hours: hours,
            resource_links: [
              { title: "React Documentation (React.dev)", url: "https://react.dev/" }
            ]
          }
        ]
      },
      {
        phase_name: "Phase 2: Scalable Backend Services, SQL & API Security",
        goal: "Design robust REST/GraphQL APIs, relational database schemas with PostgreSQL, and implement secure authentication.",
        daily_breakdown: [
          {
            title: "Day 8–13: Relational Schema Design & Query Optimization",
            description: "Design relational models with foreign keys, compound indexes, and ACID transactions. Analyze query performance with EXPLAIN.",
            estimated_duration_hours: hours,
            resource_links: [
              { title: "PostgreSQL Official Documentation", url: "https://www.postgresql.org/docs/" }
            ]
          },
          {
            title: "Day 14–18: Authentication, JWT Security & Rate Limiting",
            description: "Implement token authentication, refresh token rotation, and sliding window rate limiting middleware in Express / Next.js.",
            estimated_duration_hours: hours,
            resource_links: [
              { title: "OWASP REST Security Cheat Sheet", url: "https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html" }
            ]
          }
        ]
      },
      {
        phase_name: "Phase 3: Production Hardening, CI/CD & Capstone Deployment",
        goal: "Containerize the full-stack system, configure telemetry, and deploy to automated edge cloud infrastructure.",
        daily_breakdown: [
          {
            title: "Day 19–24: Automated Testing & Cloud Deployment",
            description: "Write integration tests with Playwright. Configure Docker multi-stage builds and deploy with automated zero-downtime rollouts.",
            estimated_duration_hours: hours,
            resource_links: [
              { title: "Playwright End-to-End Testing Guide", url: "https://playwright.dev/" }
            ]
          }
        ]
      }
    ],
    real_world_projects: [
      {
        project_name: "Collaborative Team Workspace SaaS with Real-Time Sync",
        what_you_will_build: "A complete multi-tenant productivity SaaS with real-time WebSocket state synchronization, role-based access control, and Stripe billing.",
        skills_gained: ["TypeScript", "React", "Node.js", "PostgreSQL", "WebSockets"]
      },
      {
        project_name: "High-Throughput Content Publishing Engine",
        what_you_will_build: "A headless CMS and dynamic edge publishing engine with markdown parsing, CDN edge caching, and automated image pipelines.",
        skills_gained: ["Next.js / Vite", "Cloudflare Workers", "Tailwind CSS", "Redis Caching"]
      }
    ],
    resource_aggregator: [
      { resource_type: "Canonical Guide", topic: "MDN Web Docs (Full-Stack Web)", direct_url: "https://developer.mozilla.org/" },
      { resource_type: "Course", topic: "Full Stack Open (University of Helsinki)", direct_url: "https://fullstackopen.com/en/" },
      { resource_type: "Book", topic: "Designing Data-Intensive Applications", direct_url: "https://dataintensive.net/" }
    ],
    coach_motivation_message: "The difference between a code monkey and a senior full-stack engineer is architectural intentionality. Write every line with maintainability and user value in mind."
  };
}
