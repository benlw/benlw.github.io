window.SITE_DATA = {
  selectedResearch: [
    {
      title:
        "Constraint Realization-Based Hamel Field Integrator for Geometrically Exact Euler-Bernoulli Beam Dynamics",
      image: "assets/research/constraint-integrator-comparison.webp",
      alt: "Constraint realization based Hamel integrator comparison",
      authors: [
        {
          name: "Benliang Wang",
          url: "https://www.researchgate.net/profile/Benliang-Wang-3",
        },
        {
          name: "Donghua Shi",
          url: "https://scholar.google.com/citations?hl=zh-CN&user=szJq95oAAAAJ&view_op=list_works&sortby=pubdate",
        },
        {
          name: "Zhonggui Yi",
          url: "https://www.researchgate.net/profile/Zhonggui-Yi?_tp=eyJjb250ZXh0Ijp7ImZpcnN0UGFnZSI6InByb2ZpbGUiLCJwYWdlIjoicHJvZmlsZSIsInBvc2l0aW9uIjoicGFnZUNvbnRlbnQifX0",
        },
      ],
      venue:
        "International Journal for Numerical Methods in Engineering, 2024, 126(1).",
      summary:
        "The goal of this paper is to construct a fast, qualitatively accurate integrator for the geometrically exact Euler-Bernoulli beam and, more generally, for mechanical systems with distributed infinite-dimensional holonomic constraints.",
      actions: [
        {
          icon: "fa-solid fa-link",
          label: "DOI",
          href: "https://doi.org/10.1002/nme.7603",
        },
      ],
    },
    {
      title: "Efficient Hamel's Integrator for Vehicle-Manipulator Systems",
      image: "assets/research/vms-integrator-comparison.webp",
      alt: "Efficient Hamel integrator for vehicle-manipulator systems",
      authors: [
        {
          name: "Benliang Wang",
          url: "https://www.researchgate.net/profile/Benliang-Wang-3",
        },
        {
          name: "Donghua Shi",
          url: "https://scholar.google.com/citations?hl=zh-CN&user=szJq95oAAAAJ&view_op=list_works&sortby=pubdate",
        },
        { name: "Zhipeng An" },
      ],
      venue: "Applied Mathematical Modelling, 2025.",
      summary:
        "This work proposes a singularity-free formulation for vehicle-manipulator systems based on Hamel's formalism. By applying the Lagrange-d'Alembert principle in this framework, unnecessary multipliers for velocity constraints are eliminated; an efficient variational integrator with a quasi-Newton solver then resolves discrete Hamel equations in linear complexity.",
      actions: [
        {
          icon: "fa-solid fa-link",
          label: "DOI",
          href: "https://doi.org/10.1016/j.apm.2025.116708",
        },
      ],
    },
    {
      title: "Curvature Shaping Control of Nonlinear Mechanical Systems",
      image: "assets/research/curvature-sectional-map.webp",
      alt: "Curvature shaping control visualization",
      authors: [
        {
          name: "Benliang Wang",
          url: "https://www.researchgate.net/profile/Benliang-Wang-3",
        },
        {
          name: "Yongxin Guo",
          url: "https://www.lnu.edu.cn/info/15103/81019.htm",
        },
        {
          name: "Donghua Shi",
          url: "https://scholar.google.com/citations?hl=zh-CN&user=szJq95oAAAAJ&view_op=list_works&sortby=pubdate",
        },
      ],
      venue: "Acta Mechanica Sinica, 2026.",
      summary:
        "This work develops a curvature-shaping control law for nonlinear mechanical systems and provides a geometric interpretation of stabilization through curvature wells.",
      actions: [
        {
          icon: "fa-solid fa-link",
          label: "DOI",
          href: "https://www.sciengine.com/AMS/doi/10.1007/s10409-026-25168-x",
        },
        {
          icon: "fa-brands fa-github",
          label: "Code",
          href: "https://github.com/benlw/curvature-shaping-control",
        },
        {
          icon: "fa-solid fa-circle-play",
          label: "Demo",
          href: "2024/index.html",
        },
      ],
    },
    {
      title:
        "Stabilization of a Geometrically Exact Beam Hinged on a Cart: Controlled Lagrangian Method",
      image: "assets/research/geb_hinged_on_cart.webp",
      alt: "Stabilization of a geometrically exact beam hinged on a cart",
      authors: [
        {
          name: "Benliang Wang",
          url: "https://www.researchgate.net/profile/Benliang-Wang-3",
        },
        {
          name: "Donghua Shi",
          url: "https://scholar.google.com/citations?hl=zh-CN&user=szJq95oAAAAJ&view_op=list_works&sortby=pubdate",
        },
      ],
      venue: "To be Submitted.",
      summary:
        "The paper introduces an infinite-dimensional version of the controlled Lagrangian method in Hamel's formalism for classical field theories to stabilize a geometrically exact beam hinged on a cart.",
      actions: [
        {
          icon: "fa-solid fa-circle-play",
          label: "Demo",
          href: "2024/index.html",
        },
      ],
    },
  ],

  ongoingResearch: [
    {
      id: "magneto-elastic",
      title: "Magneto-elastic Geometrically Exact Beam Control.",
      summary:
        "Developing a closed-loop static control framework for magneto-elastic beam systems with geometric consistency.",
      links: [
        {
          label: "Details",
          href: "ongoing/index.html",
        },
      ],
    },
    {
      id: "hamel-field-marl",
      title:
        "Hamel-Field Multi-Agent Deep Reinforcement Learning for Flexible Swarm Encirclement.",
      summary:
        "Within a flexible-swarm formation-control framework, this work develops deep reinforcement learning policies for cooperative encirclement of both stationary and moving targets.",
    },
    {
      id: "leapfrog-multiflexible",
      title:
        "Fast Algorithms for Multi-Flexible-Body Dynamics Using Geometrically Exact Beams.",
      summary:
        "This study constructs a leapfrog-form integrator for jointed geometrically exact beams to achieve high computational efficiency while preserving qualitatively accurate long-horizon dynamics.",
    },
  ],

  projectItems: [
    {
      title: "PaperNote AI Workspace.",
      description:
        "AI workspace for faster academic paper understanding.",
      link: {
        icon: "fa-brands fa-netlify",
        label: "Live on Netlify",
        href: "https://note.5imcs.com/",
        className: "project-link-netlify",
      },
    },
    {
      title: "Kids Learning Suite.",
      description:
        "Child-focused learning mini projects with simple interaction and creativity-oriented tasks, hosted in the",
      link: {
        icon: "fa-brands fa-github",
        label: "kids directory",
        href: "https://github.com/benlw/benlw.github.io/tree/main/kids",
      },
      suffix: ".",
      subLinks: [
        { label: "Curiosity", href: "kids/curiosity/index.html" },
        { label: "Draw", href: "kids/draw/index.html" },
        { label: "Write", href: "kids/write/index.html" },
        { label: "Math", href: "kids/math/index.html" },
      ],
    },
  ],
};
