const AppData = {
  init() {
    const initialized = localStorage.getItem('appInitialized');
    const currentVersion = 'skillbridge-v1.0.0';
    const appVersion = localStorage.getItem('appVersion');

    if (initialized === 'true' && currentVersion === appVersion) {
      console.log('App data already initialized.');
      return;
    } else {
      localStorage.clear();
    }

    localStorage.setItem('appVersion', currentVersion);

    // Initialize Users Collection
    const users = [
      {
        id: "usr_001",
        uid: "auth_001",
        firstName: "Sarah",
        lastName: "Mitchell",
        employeeId: "EMP001",
        email: "sarah.mitchell@skillbridge.com",
        jobTitle: "System Administrator",
        departmentId: "dept_001",
        teamLeadId: null,
        employeeStatus: "active",
        role: "systemAdmin",
        systemRole: "systemAdmin",
        createdTimestamp: "2024-01-10T09:00:00Z",
        modifiedTimestamp: "2025-07-15T10:30:00Z",
        createdBy: "usr_001",
        modifiedBy: "usr_001"
      },
      {
        id: "usr_002",
        uid: "auth_002",
        firstName: "James",
        lastName: "Rodriguez",
        employeeId: "EMP002",
        email: "james.rodriguez@skillbridge.com",
        jobTitle: "System Administrator",
        departmentId: "dept_001",
        teamLeadId: null,
        employeeStatus: "active",
        role: "systemAdmin",
        systemRole: "systemAdmin",
        createdTimestamp: "2024-02-20T08:45:00Z",
        modifiedTimestamp: "2025-07-10T14:20:00Z",
        createdBy: "usr_001",
        modifiedBy: "usr_001"
      },
      {
        id: "usr_003",
        uid: "auth_003",
        firstName: "David",
        lastName: "Chen",
        employeeId: "EMP003",
        email: "david.chen@skillbridge.com",
        jobTitle: "Engineering Lead",
        departmentId: "dept_002",
        teamLeadId: null,
        employeeStatus: "active",
        role: "teamLead",
        systemRole: "employee",
        createdTimestamp: "2024-03-05T10:15:00Z",
        modifiedTimestamp: "2025-07-20T11:45:00Z",
        createdBy: "usr_001",
        modifiedBy: "usr_001"
      },
      {
        id: "usr_004",
        uid: "auth_004",
        firstName: "Jennifer",
        lastName: "Anderson",
        employeeId: "EMP004",
        email: "jennifer.anderson@skillbridge.com",
        jobTitle: "Senior Software Engineer",
        departmentId: "dept_002",
        teamLeadId: "usr_003",
        employeeStatus: "active",
        role: "employee",
        systemRole: "employee",
        createdTimestamp: "2024-04-12T09:30:00Z",
        modifiedTimestamp: "2025-07-18T13:00:00Z",
        createdBy: "usr_001",
        modifiedBy: "usr_001"
      },
      {
        id: "usr_005",
        uid: "auth_005",
        firstName: "Michael",
        lastName: "Thompson",
        employeeId: "EMP005",
        email: "michael.thompson@skillbridge.com",
        jobTitle: "Junior Software Engineer",
        departmentId: "dept_002",
        teamLeadId: "usr_003",
        employeeStatus: "active",
        role: "employee",
        systemRole: "employee",
        createdTimestamp: "2024-05-20T14:00:00Z",
        modifiedTimestamp: "2025-07-22T16:30:00Z",
        createdBy: "usr_001",
        modifiedBy: "usr_001"
      },
      {
        id: "usr_006",
        uid: "auth_006",
        firstName: "Maria",
        lastName: "Garcia",
        employeeId: "EMP006",
        email: "maria.garcia@skillbridge.com",
        jobTitle: "Sales Manager",
        departmentId: "dept_003",
        teamLeadId: null,
        employeeStatus: "active",
        role: "teamLead",
        systemRole: "employee",
        createdTimestamp: "2024-06-01T08:00:00Z",
        modifiedTimestamp: "2025-07-19T10:15:00Z",
        createdBy: "usr_001",
        modifiedBy: "usr_001"
      },
      {
        id: "usr_007",
        uid: "auth_007",
        firstName: "Robert",
        lastName: "Johnson",
        employeeId: "EMP007",
        email: "robert.johnson@skillbridge.com",
        jobTitle: "Sales Executive",
        departmentId: "dept_003",
        teamLeadId: "usr_006",
        employeeStatus: "active",
        role: "employee",
        systemRole: "employee",
        createdTimestamp: "2024-06-15T11:30:00Z",
        modifiedTimestamp: "2025-07-21T09:45:00Z",
        createdBy: "usr_001",
        modifiedBy: "usr_001"
      },
      {
        id: "usr_008",
        uid: "auth_008",
        firstName: "Lisa",
        lastName: "Wang",
        employeeId: "EMP008",
        email: "lisa.wang@skillbridge.com",
        jobTitle: "Sales Executive",
        departmentId: "dept_003",
        teamLeadId: "usr_006",
        employeeStatus: "active",
        role: "employee",
        systemRole: "employee",
        createdTimestamp: "2024-07-10T13:20:00Z",
        modifiedTimestamp: "2025-07-25T15:50:00Z",
        createdBy: "usr_001",
        modifiedBy: "usr_001"
      },
      {
        id: "usr_009",
        uid: "auth_009",
        firstName: "Christopher",
        lastName: "Park",
        employeeId: "EMP009",
        email: "christopher.park@skillbridge.com",
        jobTitle: "HR Manager",
        departmentId: "dept_004",
        teamLeadId: null,
        employeeStatus: "active",
        role: "teamLead",
        systemRole: "employee",
        createdTimestamp: "2024-08-05T10:00:00Z",
        modifiedTimestamp: "2025-07-23T12:30:00Z",
        createdBy: "usr_001",
        modifiedBy: "usr_001"
      },
      {
        id: "usr_010",
        uid: "auth_010",
        firstName: "Amanda",
        lastName: "Martinez",
        employeeId: "EMP010",
        email: "amanda.martinez@skillbridge.com",
        jobTitle: "HR Specialist",
        departmentId: "dept_004",
        teamLeadId: "usr_009",
        employeeStatus: "active",
        role: "employee",
        systemRole: "employee",
        createdTimestamp: "2024-09-10T09:15:00Z",
        modifiedTimestamp: "2025-07-24T14:00:00Z",
        createdBy: "usr_001",
        modifiedBy: "usr_001"
      }
    ];
    localStorage.setItem('users', JSON.stringify(users));

    // Initialize Departments Collection
    const departments = [
      {
        id: "dept_001",
        name: "Administration",
        status: "active",
        createdTimestamp: "2024-01-05T08:00:00Z",
        modifiedTimestamp: "2025-07-15T10:00:00Z"
      },
      {
        id: "dept_002",
        name: "Engineering",
        status: "active",
        createdTimestamp: "2024-01-05T08:10:00Z",
        modifiedTimestamp: "2025-07-15T10:05:00Z"
      },
      {
        id: "dept_003",
        name: "Sales",
        status: "active",
        createdTimestamp: "2024-01-05T08:20:00Z",
        modifiedTimestamp: "2025-07-15T10:10:00Z"
      },
      {
        id: "dept_004",
        name: "Human Resources",
        status: "active",
        createdTimestamp: "2024-01-05T08:30:00Z",
        modifiedTimestamp: "2025-07-15T10:15:00Z"
      }
    ];
    localStorage.setItem('departments', JSON.stringify(departments));

    // Initialize Skill Categories Collection
    const skillCategories = [
      {
        id: "cat_001",
        categoryName: "Technical",
        status: "active",
        createdTimestamp: "2024-01-08T09:00:00Z",
        modifiedTimestamp: "2025-07-15T10:20:00Z"
      },
      {
        id: "cat_002",
        categoryName: "Behavioral",
        status: "active",
        createdTimestamp: "2024-01-08T09:10:00Z",
        modifiedTimestamp: "2025-07-15T10:25:00Z"
      },
      {
        id: "cat_003",
        categoryName: "Leadership",
        status: "active",
        createdTimestamp: "2024-01-08T09:20:00Z",
        modifiedTimestamp: "2025-07-15T10:30:00Z"
      }
    ];
    localStorage.setItem('skillCategories', JSON.stringify(skillCategories));

    // Initialize Skill Criticalities Collection
    const skillCriticalities = [
      {
        id: "crit_001",
        criticalityName: "Mission Critical",
        weight: 3.0,
        status: "active",
        createdTimestamp: "2024-01-08T10:00:00Z",
        modifiedTimestamp: "2025-07-15T10:35:00Z"
      },
      {
        id: "crit_002",
        criticalityName: "High",
        weight: 2.0,
        status: "active",
        createdTimestamp: "2024-01-08T10:10:00Z",
        modifiedTimestamp: "2025-07-15T10:40:00Z"
      },
      {
        id: "crit_003",
        criticalityName: "Medium",
        weight: 1.0,
        status: "active",
        createdTimestamp: "2024-01-08T10:20:00Z",
        modifiedTimestamp: "2025-07-15T10:45:00Z"
      }
    ];
    localStorage.setItem('skillCriticalities', JSON.stringify(skillCriticalities));

    // Initialize Skills Collection
    const skills = [
      {
        id: "skill_001",
        name: "Java Programming",
        description: "Core Java development including OOP principles, design patterns, and enterprise frameworks",
        categoryId: "cat_001",
        criticalityId: "crit_001",
        status: "active",
        createdTimestamp: "2024-01-15T09:00:00Z",
        modifiedTimestamp: "2025-07-15T11:00:00Z"
      },
      {
        id: "skill_002",
        name: "Python Development",
        description: "Python programming for data science, web development, and automation",
        categoryId: "cat_001",
        criticalityId: "crit_001",
        status: "active",
        createdTimestamp: "2024-01-15T09:10:00Z",
        modifiedTimestamp: "2025-07-15T11:05:00Z"
      },
      {
        id: "skill_003",
        name: "Communication",
        description: "Effective verbal and written communication in professional settings",
        categoryId: "cat_002",
        criticalityId: "crit_002",
        status: "active",
        createdTimestamp: "2024-01-15T09:20:00Z",
        modifiedTimestamp: "2025-07-15T11:10:00Z"
      },
      {
        id: "skill_004",
        name: "Team Leadership",
        description: "Leading teams, delegating effectively, and fostering collaboration",
        categoryId: "cat_003",
        criticalityId: "crit_002",
        status: "active",
        createdTimestamp: "2024-01-15T09:30:00Z",
        modifiedTimestamp: "2025-07-15T11:15:00Z"
      },
      {
        id: "skill_005",
        name: "Sales Negotiation",
        description: "Negotiating deals and closing sales effectively",
        categoryId: "cat_002",
        criticalityId: "crit_001",
        status: "active",
        createdTimestamp: "2024-01-15T09:40:00Z",
        modifiedTimestamp: "2025-07-15T11:20:00Z"
      },
      {
        id: "skill_006",
        name: "Database Design",
        description: "Designing and optimizing relational and non-relational databases",
        categoryId: "cat_001",
        criticalityId: "crit_001",
        status: "active",
        createdTimestamp: "2024-01-15T09:50:00Z",
        modifiedTimestamp: "2025-07-15T11:25:00Z"
      },
      {
        id: "skill_007",
        name: "Problem Solving",
        description: "Analytical thinking and systematic approach to complex challenges",
        categoryId: "cat_002",
        criticalityId: "crit_002",
        status: "active",
        createdTimestamp: "2024-01-15T10:00:00Z",
        modifiedTimestamp: "2025-07-15T11:30:00Z"
      },
      {
        id: "skill_008",
        name: "Customer Service",
        description: "Delivering excellent customer experiences and handling complaints",
        categoryId: "cat_002",
        criticalityId: "crit_002",
        status: "active",
        createdTimestamp: "2024-01-15T10:10:00Z",
        modifiedTimestamp: "2025-07-15T11:35:00Z"
      }
    ];
    localStorage.setItem('skills', JSON.stringify(skills));

    // Initialize Skill Benchmarks Collection
    const skillBenchmarks = [
      {
        id: "bench_001",
        skillId: "skill_001",
        benchmarkScore: 8,
        effectiveStartDate: "2024-01-20T00:00:00Z",
        effectiveEndDate: null,
        createdTimestamp: "2024-01-20T09:00:00Z",
        createdBy: "usr_001"
      },
      {
        id: "bench_002",
        skillId: "skill_002",
        benchmarkScore: 7,
        effectiveStartDate: "2024-01-20T00:00:00Z",
        effectiveEndDate: null,
        createdTimestamp: "2024-01-20T09:05:00Z",
        createdBy: "usr_001"
      },
      {
        id: "bench_003",
        skillId: "skill_003",
        benchmarkScore: 7,
        effectiveStartDate: "2024-01-20T00:00:00Z",
        effectiveEndDate: null,
        createdTimestamp: "2024-01-20T09:10:00Z",
        createdBy: "usr_001"
      },
      {
        id: "bench_004",
        skillId: "skill_004",
        benchmarkScore: 8,
        effectiveStartDate: "2024-01-20T00:00:00Z",
        effectiveEndDate: null,
        createdTimestamp: "2024-01-20T09:15:00Z",
        createdBy: "usr_001"
      },
      {
        id: "bench_005",
        skillId: "skill_005",
        benchmarkScore: 8,
        effectiveStartDate: "2024-01-20T00:00:00Z",
        effectiveEndDate: null,
        createdTimestamp: "2024-01-20T09:20:00Z",
        createdBy: "usr_001"
      },
      {
        id: "bench_006",
        skillId: "skill_006",
        benchmarkScore: 9,
        effectiveStartDate: "2024-01-20T00:00:00Z",
        effectiveEndDate: null,
        createdTimestamp: "2024-01-20T09:25:00Z",
        createdBy: "usr_001"
      },
      {
        id: "bench_007",
        skillId: "skill_007",
        benchmarkScore: 7,
        effectiveStartDate: "2024-01-20T00:00:00Z",
        effectiveEndDate: null,
        createdTimestamp: "2024-01-20T09:30:00Z",
        createdBy: "usr_001"
      },
      {
        id: "bench_008",
        skillId: "skill_008",
        benchmarkScore: 8,
        effectiveStartDate: "2024-01-20T00:00:00Z",
        effectiveEndDate: null,
        createdTimestamp: "2024-01-20T09:35:00Z",
        createdBy: "usr_001"
      }
    ];
    localStorage.setItem('skillBenchmarks', JSON.stringify(skillBenchmarks));

    // Initialize Assessment Cycles Collection
    const assessmentCycles = [
      {
        id: "cycle_001",
        cycleName: "Q1 2025 Assessment Cycle",
        startDate: "2025-01-01T00:00:00Z",
        endDate: "2025-03-31T23:59:59Z",
        notificationWindowDays: 14,
        reassessmentDelayDays: 14,
        mandatoryCommentThreshold: 7,
        isActiveCycle: false,
        status: "closed",
        createdTimestamp: "2024-12-20T09:00:00Z",
        modifiedTimestamp: "2025-04-01T10:00:00Z"
      },
      {
        id: "cycle_002",
        cycleName: "Q2 2025 Assessment Cycle",
        startDate: "2025-04-01T00:00:00Z",
        endDate: "2025-06-30T23:59:59Z",
        notificationWindowDays: 14,
        reassessmentDelayDays: 14,
        mandatoryCommentThreshold: 7,
        isActiveCycle: false,
        status: "closed",
        createdTimestamp: "2025-03-20T09:00:00Z",
        modifiedTimestamp: "2025-07-01T10:00:00Z"
      },
      {
        id: "cycle_003",
        cycleName: "Q3 2025 Assessment Cycle",
        startDate: "2025-07-01T00:00:00Z",
        endDate: "2025-09-30T23:59:59Z",
        notificationWindowDays: 14,
        reassessmentDelayDays: 14,
        mandatoryCommentThreshold: 7,
        isActiveCycle: true,
        status: "active",
        createdTimestamp: "2025-06-20T09:00:00Z",
        modifiedTimestamp: "2025-07-01T10:00:00Z"
      }
    ];
    localStorage.setItem('assessmentCycles', JSON.stringify(assessmentCycles));

    // Initialize Skill Mappings Collection
    const skillMappings = [
      {
        id: "map_001",
        employeeId: "usr_004",
        skillId: "skill_001",
        mappedByTeamLeadId: "usr_003",
        mappedDate: "2025-06-15T10:00:00Z",
        status: "active"
      },
      {
        id: "map_002",
        employeeId: "usr_004",
        skillId: "skill_002",
        mappedByTeamLeadId: "usr_003",
        mappedDate: "2025-06-15T10:05:00Z",
        status: "active"
      },
      {
        id: "map_003",
        employeeId: "usr_004",
        skillId: "skill_003",
        mappedByTeamLeadId: "usr_003",
        mappedDate: "2025-06-15T10:10:00Z",
        status: "active"
      },
      {
        id: "map_004",
        employeeId: "usr_004",
        skillId: "skill_007",
        mappedByTeamLeadId: "usr_003",
        mappedDate: "2025-06-15T10:15:00Z",
        status: "active"
      },
      {
        id: "map_005",
        employeeId: "usr_005",
        skillId: "skill_001",
        mappedByTeamLeadId: "usr_003",
        mappedDate: "2025-06-16T09:00:00Z",
        status: "active"
      },
      {
        id: "map_006",
        employeeId: "usr_005",
        skillId: "skill_006",
        mappedByTeamLeadId: "usr_003",
        mappedDate: "2025-06-16T09:10:00Z",
        status: "active"
      },
      {
        id: "map_007",
        employeeId: "usr_005",
        skillId: "skill_007",
        mappedByTeamLeadId: "usr_003",
        mappedDate: "2025-06-16T09:20:00Z",
        status: "active"
      },
      {
        id: "map_008",
        employeeId: "usr_007",
        skillId: "skill_005",
        mappedByTeamLeadId: "usr_006",
        mappedDate: "2025-06-20T10:00:00Z",
        status: "active"
      },
      {
        id: "map_009",
        employeeId: "usr_007",
        skillId: "skill_003",
        mappedByTeamLeadId: "usr_006",
        mappedDate: "2025-06-20T10:10:00Z",
        status: "active"
      },
      {
        id: "map_010",
        employeeId: "usr_007",
        skillId: "skill_008",
        mappedByTeamLeadId: "usr_006",
        mappedDate: "2025-06-20T10:20:00Z",
        status: "active"
      },
      {
        id: "map_011",
        employeeId: "usr_008",
        skillId: "skill_005",
        mappedByTeamLeadId: "usr_006",
        mappedDate: "2025-06-21T09:00:00Z",
        status: "active"
      },
      {
        id: "map_012",
        employeeId: "usr_008",
        skillId: "skill_003",
        mappedByTeamLeadId: "usr_006",
        mappedDate: "2025-06-21T09:15:00Z",
        status: "active"
      },
      {
        id: "map_013",
        employeeId: "usr_010",
        skillId: "skill_003",
        mappedByTeamLeadId: "usr_009",
        mappedDate: "2025-06-25T10:00:00Z",
        status: "active"
      },
      {
        id: "map_014",
        employeeId: "usr_010",
        skillId: "skill_007",
        mappedByTeamLeadId: "usr_009",
        mappedDate: "2025-06-25T10:10:00Z",
        status: "active"
      }
    ];
    localStorage.setItem('skillMappings', JSON.stringify(skillMappings));

    // Initialize Assessments Collection
    const assessments = [
      {
        id: "assess_001",
        employeeId: "usr_004",
        skillId: "skill_001",
        score: 9,
        benchmarkAtTimeOfAssessment: 8,
        comments: "Excellent grasp of Java frameworks and design patterns",
        assessedByEmployeeId: "usr_003",
        assessmentTimestamp: "2025-07-05T14:30:00Z",
        assessmentCycleId: "cycle_003",
        isLocked: true,
        tniFlag: false,
        status: "active",
        createdBy: "usr_003",
        modifiedBy: "usr_003",
        modifiedTimestamp: "2025-07-05T14:30:00Z"
      },
      {
        id: "assess_002",
        employeeId: "usr_004",
        skillId: "skill_002",
        score: 7,
        benchmarkAtTimeOfAssessment: 7,
        comments: "Competent in Python, working on advanced data science libraries",
        assessedByEmployeeId: "usr_003",
        assessmentTimestamp: "2025-07-05T14:35:00Z",
        assessmentCycleId: "cycle_003",
        isLocked: true,
        tniFlag: false,
        status: "active",
        createdBy: "usr_003",
        modifiedBy: "usr_003",
        modifiedTimestamp: "2025-07-05T14:35:00Z"
      },
      {
        id: "assess_003",
        employeeId: "usr_004",
        skillId: "skill_003",
        score: 6,
        benchmarkAtTimeOfAssessment: 7,
        comments: "Good communication in technical contexts but needs improvement in executive presentations",
        assessedByEmployeeId: "usr_003",
        assessmentTimestamp: "2025-07-05T14:40:00Z",
        assessmentCycleId: "cycle_003",
        isLocked: true,
        tniFlag: true,
        status: "active",
        createdBy: "usr_003",
        modifiedBy: "usr_003",
        modifiedTimestamp: "2025-07-05T14:40:00Z"
      },
      {
        id: "assess_004",
        employeeId: "usr_004",
        skillId: "skill_007",
        score: 8,
        benchmarkAtTimeOfAssessment: 7,
        comments: "Demonstrates strong analytical and creative problem-solving abilities",
        assessedByEmployeeId: "usr_003",
        assessmentTimestamp: "2025-07-05T14:45:00Z",
        assessmentCycleId: "cycle_003",
        isLocked: true,
        tniFlag: false,
        status: "active",
        createdBy: "usr_003",
        modifiedBy: "usr_003",
        modifiedTimestamp: "2025-07-05T14:45:00Z"
      },
      {
        id: "assess_005",
        employeeId: "usr_005",
        skillId: "skill_001",
        score: 6,
        benchmarkAtTimeOfAssessment: 8,
        comments: "Still developing expertise in enterprise Java patterns and frameworks",
        assessedByEmployeeId: "usr_003",
        assessmentTimestamp: "2025-07-08T10:15:00Z",
        assessmentCycleId: "cycle_003",
        isLocked: true,
        tniFlag: true,
        status: "active",
        createdBy: "usr_003",
        modifiedBy: "usr_003",
        modifiedTimestamp: "2025-07-08T10:15:00Z"
      },
      {
        id: "assess_006",
        employeeId: "usr_005",
        skillId: "skill_006",
        score: 5,
        benchmarkAtTimeOfAssessment: 9,
        comments: "Needs significant improvement in database optimization and complex query design",
        assessedByEmployeeId: "usr_003",
        assessmentTimestamp: "2025-07-08T10:20:00Z",
        assessmentCycleId: "cycle_003",
        isLocked: true,
        tniFlag: true,
        status: "active",
        createdBy: "usr_003",
        modifiedBy: "usr_003",
        modifiedTimestamp: "2025-07-08T10:20:00Z"
      },
      {
        id: "assess_007",
        employeeId: "usr_005",
        skillId: "skill_007",
        score: 7,
        benchmarkAtTimeOfAssessment: 7,
        comments: "Good problem-solving skills for standard development challenges",
        assessedByEmployeeId: "usr_003",
        assessmentTimestamp: "2025-07-08T10:25:00Z",
        assessmentCycleId: "cycle_003",
        isLocked: true,
        tniFlag: false,
        status: "active",
        createdBy: "usr_003",
        modifiedBy: "usr_003",
        modifiedTimestamp: "2025-07-08T10:25:00Z"
      },
      {
        id: "assess_008",
        employeeId: "usr_007",
        skillId: "skill_005",
        score: 8,
        benchmarkAtTimeOfAssessment: 8,
        comments: "Excellent negotiation skills demonstrated in recent client negotiations",
        assessedByEmployeeId: "usr_006",
        assessmentTimestamp: "2025-07-10T15:00:00Z",
        assessmentCycleId: "cycle_003",
        isLocked: true,
        tniFlag: false,
        status: "active",
        createdBy: "usr_006",
        modifiedBy: "usr_006",
        modifiedTimestamp: "2025-07-10T15:00:00Z"
      },
      {
        id: "assess_009",
        employeeId: "usr_007",
        skillId: "skill_003",
        score: 7,
        benchmarkAtTimeOfAssessment: 7,
        comments: "Clear communicator with good presentation skills",
        assessedByEmployeeId: "usr_006",
        assessmentTimestamp: "2025-07-10T15:10:00Z",
        assessmentCycleId: "cycle_003",
        isLocked: true,
        tniFlag: false,
        status: "active",
        createdBy: "usr_006",
        modifiedBy: "usr_006",
        modifiedTimestamp: "2025-07-10T15:10:00Z"
      },
      {
        id: "assess_010",
        employeeId: "usr_007",
        skillId: "skill_008",
        score: 9,
        benchmarkAtTimeOfAssessment: 8,
        comments: "Exceptional customer service, consistently receives positive feedback",
        assessedByEmployeeId: "usr_006",
        assessmentTimestamp: "2025-07-10T15:20:00Z",
        assessmentCycleId: "cycle_003",
        isLocked: true,
        tniFlag: false,
        status: "active",
        createdBy: "usr_006",
        modifiedBy: "usr_006",
        modifiedTimestamp: "2025-07-10T15:20:00Z"
      },
      {
        id: "assess_011",
        employeeId: "usr_008",
        skillId: "skill_005",
        score: 6,
        benchmarkAtTimeOfAssessment: 8,
        comments: "Developing negotiation skills, needs more practice in complex deals",
        assessedByEmployeeId: "usr_006",
        assessmentTimestamp: "2025-07-12T14:00:00Z",
        assessmentCycleId: "cycle_003",
        isLocked: true,
        tniFlag: true,
        status: "active",
        createdBy: "usr_006",
        modifiedBy: "usr_006",
        modifiedTimestamp: "2025-07-12T14:00:00Z"
      },
      {
        id: "assess_012",
        employeeId: "usr_008",
        skillId: "skill_003",
        score: 8,
        benchmarkAtTimeOfAssessment: 7,
        comments: "Strong communicator with ability to build rapport with clients",
        assessedByEmployeeId: "usr_006",
        assessmentTimestamp: "2025-07-12T14:10:00Z",
        assessmentCycleId: "cycle_003",
        isLocked: true,
        tniFlag: false,
        status: "active",
        createdBy: "usr_006",
        modifiedBy: "usr_006",
        modifiedTimestamp: "2025-07-12T14:10:00Z"
      }
    ];
    localStorage.setItem('assessments', JSON.stringify(assessments));

    // Initialize Disputes Collection
    const disputes = [
      {
        id: "disp_001",
        employeeId: "usr_005",
        assessmentCycleId: "cycle_003",
        disputedSkills: [
          {
            skillId: "skill_006",
            originalScore: 5,
            reason: "I successfully designed the new data warehouse schema which received positive feedback from senior architects"
          }
        ],
        reason: "My assessment score of 5 for Database Design does not reflect my actual contributions and successful project work",
        status: "open",
        resolvedByAdminId: null,
        resolutionTimestamp: null,
        resolutionAction: null,
        resolutionNotes: null,
        rejectionReason: null,
        auditTrail: [
          {
            action: "submitted",
            actorId: "usr_005",
            actorType: "employee",
            timestamp: "2025-07-20T09:30:00Z",
            details: "Employee disputed Database Design assessment score"
          }
        ],
        submissionDate: "2025-07-20T09:30:00Z"
      },
      {
        id: "disp_002",
        employeeId: "usr_004",
        assessmentCycleId: "cycle_003",
        disputedSkills: [
          {
            skillId: "skill_003",
            originalScore: 6,
            reason: "I regularly present to clients and stakeholders with positive feedback. The assessment was based on limited evidence."
          }
        ],
        reason: "My Communication assessment score of 6 does not accurately represent my presentation and communication abilities",
        status: "resolved",
        resolvedByAdminId: "usr_001",
        resolutionTimestamp: "2025-07-25T11:00:00Z",
        resolutionAction: "editRating",
        resolutionNotes: "Reviewed additional evidence of communication effectiveness in client presentations. Score updated to 7.",
        rejectionReason: null,
        auditTrail: [
          {
            action: "submitted",
            actorId: "usr_004",
            actorType: "employee",
            timestamp: "2025-07-22T10:15:00Z",
            details: "Employee disputed Communication assessment score"
          },
          {
            action: "resolved",
            actorId: "usr_001",
            actorType: "admin",
            timestamp: "2025-07-25T11:00:00Z",
            details: "Admin reviewed evidence and edited rating from 6 to 7"
          }
        ],
        submissionDate: "2025-07-22T10:15:00Z"
      },
      {
        id: "disp_003",
        employeeId: "usr_008",
        assessmentCycleId: "cycle_003",
        disputedSkills: [
          {
            skillId: "skill_005",
            originalScore: 6,
            reason: "I successfully closed three major deals in Q2 which demonstrates advanced negotiation capabilities"
          }
        ],
        reason: "Sales Negotiation score of 6 underestimates my recent sales performance and closed deals",
        status: "open",
        resolvedByAdminId: null,
        resolutionTimestamp: null,
        resolutionAction: null,
        resolutionNotes: null,
        rejectionReason: null,
        auditTrail: [
          {
            action: "submitted",
            actorId: "usr_008",
            actorType: "employee",
            timestamp: "2025-07-26T13:45:00Z",
            details: "Employee disputed Sales Negotiation assessment score"
          }
        ],
        submissionDate: "2025-07-26T13:45:00Z"
      }
    ];
    localStorage.setItem('disputes', JSON.stringify(disputes));

    // Initialize Training Sessions Collection
    const trainingSessions = [
      {
        id: "train_001",
        skillId: "skill_001",
        trainerId: "usr_004",
        trainerType: "internal",
        scheduledDate: "2025-08-05T09:00:00Z",
        endDate: "2025-08-05T12:00:00Z",
        mode: "offline",
        capacity: 8,
        assignedEmployees: [
          {
            employeeId: "usr_005",
            assignmentDate: "2025-07-28T10:00:00Z",
            attendanceStatus: "assigned"
          }
        ],
        status: "scheduled",
        createdTimestamp: "2025-07-15T14:00:00Z",
        createdBy: "usr_001"
      },
      {
        id: "train_002",
        skillId: "skill_003",
        trainerId: "ext_trainer_001",
        trainerType: "external",
        scheduledDate: "2025-08-12T10:00:00Z",
        endDate: "2025-08-12T14:00:00Z",
        mode: "online",
        capacity: 15,
        assignedEmployees: [
          {
            employeeId: "usr_004",
            assignmentDate: "2025-07-29T09:00:00Z",
            attendanceStatus: "assigned"
          },
          {
            employeeId: "usr_008",
            assignmentDate: "2025-07-29T09:15:00Z",
            attendanceStatus: "assigned"
          }
        ],
        status: "scheduled",
        createdTimestamp: "2025-07-18T11:00:00Z",
        createdBy: "usr_001"
      },
      {
        id: "train_003",
        skillId: "skill_006",
        trainerId: "usr_004",
        trainerType: "internal",
        scheduledDate: "2025-08-20T09:00:00Z",
        endDate: "2025-08-20T16:00:00Z",
        mode: "offline",
        capacity: 6,
        assignedEmployees: [
          {
            employeeId: "usr_005",
            assignmentDate: "2025-07-28T14:00:00Z",
            attendanceStatus: "assigned"
          }
        ],
        status: "scheduled",
        createdTimestamp: "2025-07-20T10:00:00Z",
        createdBy: "usr_001"
      },
      {
        id: "train_004",
        skillId: "skill_005",
        trainerId: "ext_trainer_002",
        trainerType: "external",
        scheduledDate: "2025-08-15T13:00:00Z",
        endDate: "2025-08-15T17:00:00Z",
        mode: "online",
        capacity: 12,
        assignedEmployees: [
          {
            employeeId: "usr_008",
            assignmentDate: "2025-07-29T10:30:00Z",
            attendanceStatus: "assigned"
          }
        ],
        status: "scheduled",
        createdTimestamp: "2025-07-22T15:00:00Z",
        createdBy: "usr_001"
      }
    ];
    localStorage.setItem('trainingSessions', JSON.stringify(trainingSessions));

    // Initialize Trainer Eligibility Collection
    const trainerEligibility = [
      {
        id: "elig_001",
        employeeId: "usr_004",
        skillId: "skill_001",
        flaggedByTeamLeadId: "usr_003",
        status: "active",
        createdTimestamp: "2025-06-20T10:00:00Z"
      },
      {
        id: "elig_002",
        employeeId: "usr_004",
        skillId: "skill_002",
        flaggedByTeamLeadId: "usr_003",
        status: "active",
        createdTimestamp: "2025-06-20T10:05:00Z"
      },
      {
        id: "elig_003",
        employeeId: "usr_007",
        skillId: "skill_005",
        flaggedByTeamLeadId: "usr_006",
        status: "active",
        createdTimestamp: "2025-06-25T11:00:00Z"
      }
    ];
    localStorage.setItem('trainerEligibility', JSON.stringify(trainerEligibility));

    // Initialize External Trainers Collection
    const externalTrainers = [
      {
        id: "ext_trainer_001",
        name: "Patricia Williams",
        email: "patricia.williams@trainingpro.com",
        skills: [
          { skillId: "skill_003" },
          { skillId: "skill_007" }
        ],
        contactInfo: {
          phone: "+1-555-0101",
          address: "123 Training Lane, Boston, MA 02101"
        },
        status: "active",
        createdTimestamp: "2025-05-10T09:00:00Z",
        modifiedTimestamp: "2025-07-15T14:30:00Z"
      },
      {
        id: "ext_trainer_002",
        name: "Thomas Mitchell",
        email: "thomas.mitchell@salesexcellence.com",
        skills: [
          { skillId: "skill_005" },
          { skillId: "skill_008" }
        ],
        contactInfo: {
          phone: "+1-555-0102",
          address: "456 Sales Ave, New York, NY 10001"
        },
        status: "active",
        createdTimestamp: "2025-05-15T10:00:00Z",
        modifiedTimestamp: "2025-07-20T11:00:00Z"
      },
      {
        id: "ext_trainer_003",
        name: "Jennifer Cole",
        email: "jennifer.cole@techtraining.net",
        skills: [
          { skillId: "skill_001" },
          { skillId: "skill_006" }
        ],
        contactInfo: {
          phone: "+1-555-0103",
          address: "789 Tech Road, San Francisco, CA 94105"
        },
        status: "active",
        createdTimestamp: "2025-05-20T08:30:00Z",
        modifiedTimestamp: "2025-07-18T13:15:00Z"
      }
    ];
    localStorage.setItem('externalTrainers', JSON.stringify(externalTrainers));

    // Initialize Training Needs Collection
    const trainingNeeds = [
      {
        id: "tni_001",
        employeeId: "usr_004",
        skillId: "skill_003",
        gap: 1,
        benchmarkScore: 7,
        employeeScore: 6,
        criticalityWeight: 2.0,
        tniStatus: "trainingRequired",
        assessmentId: "assess_003",
        createdTimestamp: "2025-07-05T14:40:00Z"
      },
      {
        id: "tni_002",
        employeeId: "usr_005",
        skillId: "skill_001",
        gap: 2,
        benchmarkScore: 8,
        employeeScore: 6,
        criticalityWeight: 3.0,
        tniStatus: "trainingRequired",
        assessmentId: "assess_005",
        createdTimestamp: "2025-07-08T10:15:00Z"
      },
      {
        id: "tni_003",
        employeeId: "usr_005",
        skillId: "skill_006",
        gap: 4,
        benchmarkScore: 9,
        employeeScore: 5,
        criticalityWeight: 3.0,
        tniStatus: "trainingRequired",
        assessmentId: "assess_006",
        createdTimestamp: "2025-07-08T10:20:00Z"
      },
      {
        id: "tni_004",
        employeeId: "usr_008",
        skillId: "skill_005",
        gap: 2,
        benchmarkScore: 8,
        employeeScore: 6,
        criticalityWeight: 3.0,
        tniStatus: "trainingRequired",
        assessmentId: "assess_011",
        createdTimestamp: "2025-07-12T14:00:00Z"
      }
    ];
    localStorage.setItem('trainingNeeds', JSON.stringify(trainingNeeds));

    // Initialize Training Feedback Collection
    const trainingFeedback = [
      {
        id: "feedback_001",
        sessionId: "train_001",
        employeeId: "usr_005",
        rating: 5,
        comments: "Excellent training delivery with clear explanations and practical examples. Trainer was very knowledgeable and responsive to questions.",
        submissionDate: "2025-08-10T16:00:00Z"
      },
      {
        id: "feedback_002",
        sessionId: "train_002",
        employeeId: "usr_004",
        rating: 4,
        comments: "Good content and structure. Would have preferred more interactive activities and group discussions.",
        submissionDate: "2025-08-15T15:30:00Z"
      }
    ];
    localStorage.setItem('trainingFeedback', JSON.stringify(trainingFeedback));

    // Mark initialization as complete
    localStorage.setItem('appInitialized', 'true');
    console.log('SkillBridge application data successfully initialized in Local Storage.');
  }
};

AppData.init();