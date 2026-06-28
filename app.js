const STORAGE_KEY = "cabinet-ninja-run-list-v1";
const TABLES = [
  "suppliers",
  "leads",
  "jobs",
  "categories",
  "items",
  "checklist_templates",
  "checklist_template_sections",
  "checklist_template_items",
  "job_checklists",
  "job_checklist_sections",
  "job_checklist_items",
];

const STATUS_OPTIONS = [
  ["needed", "Needed"],
  ["ordered", "Ordered"],
  ["ready_to_collect", "Ready to collect"],
  ["picked_up", "Picked up"],
  ["done", "Done"],
  ["cancelled", "Cancelled"],
];

const TYPE_OPTIONS = [
  ["pickup", "Pickup"],
  ["order", "Order"],
  ["delivery", "Delivery"],
  ["stock", "Stock"],
];

const PRIORITY_OPTIONS = [
  ["low", "Low"],
  ["normal", "Normal"],
  ["urgent", "Urgent"],
];

const COMPLETED_STATUSES = new Set(["picked_up", "done", "cancelled"]);
const CLOSED_JOB_STATUSES = new Set(["complete", "completed", "done", "cancelled", "archived"]);
const CLOSED_LEAD_STATUSES = new Set(["job_accepted", "job_declined", "accepted", "won", "lost", "cancelled"]);
const JOB_NUMBER_PREFIX = "CN";
const JOB_NUMBER_PAD = 4;

const LEAD_STATUS_OPTIONS = [
  ["new_lead", "New lead"],
  ["contacted", "Contacted"],
  ["needs_photos_measurements", "Needs photos/measurements"],
  ["ballpark_sent", "Ballpark sent"],
  ["to_measure_up", "To measure up"],
  ["measure_booked", "Measure booked"],
  ["measured", "Measured"],
  ["to_quote", "To quote"],
  ["design_quote_in_progress", "Design/quote in progress"],
  ["quoted", "Quoted"],
  ["quote_sent", "Quote sent"],
  ["waiting_on_client", "Waiting on client"],
  ["follow_up", "Follow up"],
  ["job_accepted", "Job accepted"],
  ["job_declined", "Job declined"],
  ["lost", "Lost"],
  ["cancelled", "Cancelled"],
];

const JOB_STAGE_OPTIONS = [
  ["active", "Active"],
  ["job_accepted", "Job accepted"],
  ["accepted_deposit_needed", "Accepted / deposit needed"],
  ["deposit_paid", "Deposit paid"],
  ["materials_to_order", "Materials to order"],
  ["materials_ordered", "Materials ordered"],
  ["materials_all_arrived", "Materials all arrived"],
  ["ready_to_machine", "Ready to machine"],
  ["machining", "Machining"],
  ["assembly", "Assembly"],
  ["cut_and_build", "Cut and build"],
  ["ready_to_install", "Ready to install"],
  ["load_into_install_trailer", "Load into install trailer"],
  ["packed", "Packed"],
  ["install", "Install"],
  ["installing", "Installing"],
  ["installed", "Installed"],
  ["qc_defects", "QC / defects"],
  ["final_invoice_due", "Final invoice due"],
  ["complete", "Complete"],
  ["cancelled", "Cancelled"],
  ["archived", "Archived"],
];

const LEAD_PIPELINE_STAGES = [
  "new_lead",
  "contacted",
  "needs_photos_measurements",
  "ballpark_sent",
  "to_measure_up",
  "measure_booked",
  "measured",
  "to_quote",
  "design_quote_in_progress",
  "quoted",
  "quote_sent",
  "waiting_on_client",
  "follow_up",
  "job_accepted",
  "job_declined",
];

const JOB_PIPELINE_STAGES = [
  "active",
  "job_accepted",
  "accepted_deposit_needed",
  "deposit_paid",
  "materials_to_order",
  "materials_ordered",
  "materials_all_arrived",
  "ready_to_machine",
  "machining",
  "assembly",
  "cut_and_build",
  "ready_to_install",
  "load_into_install_trailer",
  "packed",
  "install",
  "installing",
  "installed",
  "qc_defects",
  "final_invoice_due",
  "complete",
  "cancelled",
];

const CHECKLIST_TYPE_OPTIONS = [
  ["packing", "Packing"],
  ["qc_completion", "QC completion"],
  ["site_arrival", "Site arrival"],
  ["build_readiness", "Build readiness"],
  ["measure_up", "Measure-up"],
  ["delivery", "Delivery"],
  ["custom", "Custom"],
];

const CHECKLIST_STATUS_OPTIONS = [
  ["not_started", "Not started"],
  ["in_progress", "In progress"],
  ["complete", "Complete"],
  ["archived", "Archived"],
];

const ISSUE_STATUS_OPTIONS = [
  ["none", "No issue"],
  ["issue_found", "Issue found"],
  ["to_fix", "To fix"],
  ["fixed", "Fixed"],
  ["accepted", "Accepted"],
  ["not_applicable", "Not applicable"],
];

const DEFAULT_DATA = {
  suppliers: [
    supplier("Bunnings", "Hardware", "Tokoroa"),
    supplier("Impey's", "Cabinet hardware", "Rotorua"),
    supplier("Goldpine Putaruru", "Timber", "Putaruru"),
    supplier("ITM Tokoroa", "Building supplies", "Tokoroa"),
    supplier("Carters", "Building supplies", ""),
    supplier("Mercer", "Sink/tap", ""),
    supplier("Sage Doors", "Doors", ""),
    supplier("Prime Panels", "Panels", ""),
    supplier("Amorini", "Benchtops", ""),
    supplier("Electrical wholesaler", "Electrical", ""),
    supplier("Plumbing supplier", "Plumbing", ""),
    supplier("General farm supplies", "Farm supplies", ""),
  ],
  leads: [],
  jobs: [
    job("CN-0042", "Charis Mariner", "Charis Mariner", "", "active"),
    job("", "Hayley Bregman", "Hayley Bregman", "", "active"),
    job("", "Roger Skiffington", "Roger Skiffington", "", "active"),
    job("", "Calf Shelter", "Calf Shelter", "", "active"),
    job("", "Workshop Stock", "Workshop Stock", "Workshop", "active"),
    job("", "Farm General", "Farm General", "Farm", "active"),
  ],
  categories: [
    category("Hardware"),
    category("Edge banding"),
    category("Panels"),
    category("Benchtop"),
    category("Sink/tap"),
    category("Electrical"),
    category("Plumbing"),
    category("Timber"),
    category("Fasteners"),
    category("Consumables"),
    category("Farm supplies"),
    category("Roofing"),
    category("Install items"),
  ],
  items: [],
  checklist_templates: [],
  checklist_template_sections: [],
  checklist_template_items: [],
  job_checklists: [],
  job_checklist_sections: [],
  job_checklist_items: [],
};

const seedItems = [
  {
    item_name: "100x100 H4 posts",
    quantity: "8",
    unit: "each",
    supplier: "Goldpine Putaruru",
    job: "Calf Shelter",
    category: "Timber",
    type: "pickup",
    status: "needed",
    priority: "normal",
    notes: "3.6m long, check straightness",
  },
  {
    item_name: "Prime Whisper edge tape",
    quantity: "25",
    unit: "m",
    supplier: "Impey's",
    job: "Charis Mariner",
    category: "Edge banding",
    type: "order",
    status: "needed",
    priority: "normal",
    notes: "Match Prime Panels Whisper cabinetry",
  },
  {
    item_name: "Silicone white",
    quantity: "4",
    unit: "tubes",
    supplier: "Bunnings",
    job: "Workshop Stock",
    category: "Consumables",
    type: "pickup",
    status: "needed",
    priority: "normal",
    notes: "Keep on shelf for installs",
  },
  {
    item_name: "Black handles 160mm centres",
    quantity: "24",
    unit: "each",
    supplier: "Impey's",
    job: "Charis Mariner",
    category: "Hardware",
    type: "order",
    status: "needed",
    priority: "normal",
    notes: "",
  },
];

let state = { suppliers: [], leads: [], jobs: [], categories: [], items: [] };
let dataStore = null;
let backendStatus = {
  mode: "local",
  message: "Local browser storage",
  userEmail: "",
};
let remoteSaveQueue = Promise.resolve();
let dashboardColumnsAvailable = true;

const app = document.getElementById("app");
const title = document.getElementById("screenTitle");
const backButton = document.getElementById("backButton");
const quickAddButton = document.getElementById("quickAddButton");

window.addEventListener("hashchange", () => {
  if (backendStatus.authRequired) {
    renderAuthScreen();
    return;
  }
  render();
});
window.addEventListener("DOMContentLoaded", initializeApp);

async function initializeApp() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js").catch(() => {});
  }
  quickAddButton.addEventListener("click", () => navigate("/add"));
  backButton.addEventListener("click", () => history.back());
  renderLoading();

  dataStore = createDataStore();
  const loaded = await dataStore.load();
  backendStatus = {
    mode: loaded.mode,
    message: loaded.message,
    userEmail: loaded.userEmail || "",
    authRequired: loaded.authRequired || false,
  };

  if (loaded.authRequired) {
    state = loadLocalState(false);
    renderAuthScreen();
    return;
  }

  state = loaded.state;
  render();
}

function supplier(supplier_name, supplier_type, town = "") {
  return {
    id: uid("sup"),
    supplier_name,
    supplier_type,
    town,
    default_contact: "",
    notes: "",
    active: true,
  };
}

function job(job_number, client_name, job_name, location, status) {
  const now = nowIso();
  return {
    id: uid("job"),
    job_number,
    client_name,
    job_name,
    location,
    status,
    priority: "normal",
    next_action: "",
    next_action_due_date: "",
    target_install_date: "",
    created_at: now,
    updated_at: now,
    active: true,
  };
}

function category(category_name) {
  return {
    id: uid("cat"),
    category_name,
    notes: "",
  };
}

function checklistTemplate(id, name, type, description = "") {
  const now = nowIso();
  return {
    id,
    name,
    type,
    description,
    active: true,
    created_at: now,
    updated_at: now,
  };
}

function checklistTemplateSection(id, template_id, section_name, sort_order) {
  const now = nowIso();
  return {
    id,
    template_id,
    section_name,
    sort_order,
    created_at: now,
    updated_at: now,
  };
}

function checklistTemplateItem(id, section_id, item_text, sort_order, options = {}) {
  const now = nowIso();
  return {
    id,
    section_id,
    item_text,
    sort_order,
    required: options.required !== false,
    default_notes: options.default_notes || "",
    allow_photo: Boolean(options.allow_photo),
    created_at: now,
    updated_at: now,
  };
}

function uid(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function nowIso() {
  return new Date().toISOString();
}

function buildSeedState() {
  const data = JSON.parse(JSON.stringify(DEFAULT_DATA));
  Object.assign(data, buildDefaultChecklistTemplateState());
  const supplierByName = Object.fromEntries(data.suppliers.map((item) => [item.supplier_name, item.id]));
  const jobByName = Object.fromEntries(data.jobs.map((item) => [item.job_name, item.id]));
  const categoryByName = Object.fromEntries(data.categories.map((item) => [item.category_name, item.id]));
  data.items = seedItems.map((item) => createItem({
    ...item,
    supplier_id: supplierByName[item.supplier],
    job_id: jobByName[item.job],
    category_id: categoryByName[item.category],
  }));
  return data;
}

function buildDefaultChecklistTemplateState() {
  const templates = [
    checklistTemplate("tmpl_packing_standard_install", "Standard Kitchen/Laundry Install Packing Checklist", "packing", "Workshop packing list before leaving for install."),
    checklistTemplate("tmpl_qc_standard_install", "Standard Kitchen/Laundry QC Completion Checklist", "qc_completion", "Site completion and handover quality checklist."),
  ];
  const sections = [];
  const items = [];

  addTemplateSections(sections, items, templates[0].id, [
    ["Job information", [
      "Final drawings loaded/printed",
      "Site measurements checked",
      "Client notes checked",
      "Appliance specs checked if relevant",
      "Sink/tap cutout specs checked if relevant",
      "Access/site instructions checked",
      "Job contact details available",
    ]],
    ["Cabinets and job parts", [
      "Base cabinets loaded",
      "Wall cabinets loaded",
      "Tall cabinets loaded if required",
      "Doors loaded and protected",
      "Drawer fronts loaded and protected",
      "Drawers loaded",
      "End panels loaded",
      "Fillers/scribers loaded",
      "Toe kicks/kickboards loaded",
      "Shelves loaded",
      "Hardware packed",
      "Handles packed",
      "Hinges packed",
      "Drawer runners packed",
      "Cover caps packed",
      "Touch-up parts packed",
    ]],
    ["Benchtop/splashback/sink", [
      "Benchtop loaded and protected",
      "Benchtop joins/hardware packed if required",
      "Upstands/splashback loaded if required",
      "Sink loaded if supplied by Cabinet Ninja",
      "Tap/mixer loaded if supplied by Cabinet Ninja",
      "Waste kit loaded if required",
      "Sink clips/sealant packed",
      "Cutout templates/specs checked if required",
    ]],
    ["Install consumables", [
      "Screws",
      "Packers/shims",
      "Brackets",
      "Wall plugs/fixings",
      "Silicone/sealant",
      "Construction adhesive",
      "Masking tape",
      "Rags",
      "Cleaning spray",
      "Drill bits",
      "Driver bits",
      "Jigsaw blades",
      "Multi-tool blades",
      "Pencils/markers",
      "Caulking gun",
      "Rubbish bags",
    ]],
    ["Tools", [
      "Drill/driver",
      "Impact driver",
      "Batteries",
      "Battery charger",
      "Track saw/circular saw",
      "Jigsaw",
      "Multi-tool",
      "Laser level",
      "Spirit level",
      "Tape measure",
      "Clamps",
      "Scribing tools",
      "Vacuum",
      "Extension lead",
      "Work lights",
      "Saw horses",
      "Router/trimmer if required",
    ]],
    ["Trailer/load check", [
      "Cabinets secured",
      "Doors/fronts protected",
      "Benchtop protected",
      "Fragile parts secured",
      "Tools loaded",
      "Consumables loaded",
      "Drop sheets loaded",
      "Trailer lights checked",
      "Straps/tie-downs checked",
    ]],
  ]);

  addTemplateSections(sections, items, templates[1].id, [
    ["Cabinet alignment", [
      "Base cabinets level",
      "Wall cabinets level",
      "Tall cabinets plumb",
      "Cabinet gaps consistent",
      "Doors aligned",
      "Drawer fronts aligned",
      "End panels tidy",
      "Fillers/scribers tidy",
      "Toe kicks fitted properly",
      "No obvious chips/scratches",
    ]],
    ["Doors and drawers", [
      "All doors open/close correctly",
      "Hinges adjusted",
      "Drawers open/close smoothly",
      "Soft-close working",
      "Handles fitted straight",
      "Handle spacing consistent",
      "No rubbing",
      "No missing screws/caps",
    ]],
    ["Benchtop and sealing", [
      "Benchtop level",
      "Benchtop joins tight if applicable",
      "Cutouts clean",
      "Edges tidy",
      "Upstands/splashback fitted if applicable",
      "Silicone neat",
      "No visible benchtop damage",
      "Sink/tap area sealed if applicable",
    ]],
    ["Appliances and service openings", [
      "Oven opening correct",
      "Dishwasher space correct",
      "Rangehood position/opening correct",
      "Fridge space correct",
      "Sink fitted if included",
      "Tap hole/cutout correct",
      "Waste/plumbing access clear",
      "Electrical/plumbing exclusions noted if not completed by Cabinet Ninja",
    ]],
    ["Site finish", [
      "Cabinets wiped down",
      "Benchtop cleaned",
      "Dust vacuumed",
      "Rubbish removed or stacked as agreed",
      "Old kitchen/removal exclusions handled as agreed",
      "Leftover parts labelled",
      "Client-supplied parts returned/left tidy",
      "Before/after photos taken",
    ]],
    ["Client handover", [
      "Client walked through job if available",
      "Minor defects/issues recorded",
      "Exclusions explained",
      "Future trades noted",
      "Care/warranty notes sent or ready to send",
      "Final invoice/payment trigger ready",
      "Job can be marked complete",
    ]],
  ]);

  return {
    checklist_templates: templates,
    checklist_template_sections: sections,
    checklist_template_items: items,
  };
}

function addTemplateSections(sections, items, templateId, sectionSpecs) {
  sectionSpecs.forEach(([sectionName, sectionItems], sectionIndex) => {
    const sectionId = `${templateId}_sec_${sectionIndex + 1}`;
    sections.push(checklistTemplateSection(sectionId, templateId, sectionName, sectionIndex + 1));
    sectionItems.forEach((itemText, itemIndex) => {
      items.push(checklistTemplateItem(`${sectionId}_item_${itemIndex + 1}`, sectionId, itemText, itemIndex + 1, {
        allow_photo: /photos|damage|scratches|chips/i.test(itemText),
      }));
    });
  });
}

function loadLocalState(persistSeed = true) {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return normalizeState(JSON.parse(saved));
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  const data = buildSeedState();
  if (persistSeed) {
    saveState(data);
  } else {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
  return data;
}

function normalizeState(data) {
  const normalized = {
    suppliers: (data.suppliers || []).map((item) => ({
      default_contact: "",
      notes: "",
      town: "",
      supplier_type: "",
      active: true,
      ...item,
      town: item.town || "",
      default_contact: item.default_contact || "",
      notes: item.notes || "",
    })),
    leads: (data.leads || []).map((item) => ({
      lead_name: "",
      client_name: "",
      phone: "",
      email: "",
      location: "",
      source: "",
      status: "new_lead",
      priority: "normal",
      next_follow_up: "",
      next_action: "",
      next_action_due_date: "",
      last_contacted_at: "",
      notes: "",
      converted_job_id: "",
      active: true,
      ...item,
      lead_name: item.lead_name || "",
      client_name: item.client_name || "",
      phone: item.phone || "",
      email: item.email || "",
      location: item.location || "",
      source: item.source || "",
      status: item.status || "new_lead",
      priority: item.priority || "normal",
      next_follow_up: item.next_follow_up || "",
      next_action: item.next_action || "",
      next_action_due_date: item.next_action_due_date || "",
      last_contacted_at: item.last_contacted_at || "",
      notes: item.notes || "",
      converted_job_id: item.converted_job_id || "",
      active: item.active !== false,
    })),
    jobs: (data.jobs || []).map((item) => ({
      job_number: "",
      client_name: "",
      job_name: "",
      location: "",
      status: "active",
      priority: "normal",
      next_action: "",
      next_action_due_date: "",
      target_install_date: "",
      active: true,
      ...item,
      job_number: item.job_number || "",
      client_name: item.client_name || "",
      job_name: item.job_name || "",
      location: item.location || "",
      status: item.status || "active",
      priority: item.priority || "normal",
      next_action: item.next_action || "",
      next_action_due_date: item.next_action_due_date || "",
      target_install_date: item.target_install_date || "",
    })),
    categories: (data.categories || []).map((item) => ({
      notes: "",
      ...item,
      notes: item.notes || "",
    })),
    items: (data.items || []).map((item) => ({
      photo_url: "",
      product_link: "",
      completed_at: null,
      ...item,
      quantity: item.quantity || "",
      unit: item.unit || "",
      job_id: item.job_id || "",
      category_id: item.category_id || "",
      needed_by: item.needed_by || "",
      notes: item.notes || "",
      product_link: item.product_link || "",
      photo_url: item.photo_url || "",
    })),
    checklist_templates: (data.checklist_templates || []).map((item) => ({
      description: "",
      active: true,
      ...item,
      description: item.description || "",
      active: item.active !== false,
    })),
    checklist_template_sections: (data.checklist_template_sections || []).map((item) => ({
      sort_order: 0,
      ...item,
      section_name: item.section_name || "",
      sort_order: Number(item.sort_order || 0),
    })),
    checklist_template_items: (data.checklist_template_items || []).map((item) => ({
      required: true,
      default_notes: "",
      allow_photo: false,
      sort_order: 0,
      ...item,
      item_text: item.item_text || "",
      required: item.required !== false,
      default_notes: item.default_notes || "",
      allow_photo: Boolean(item.allow_photo),
      sort_order: Number(item.sort_order || 0),
    })),
    job_checklists: (data.job_checklists || []).map((item) => ({
      template_id: "",
      status: "not_started",
      completed_at: null,
      override_note: "",
      ...item,
      template_id: item.template_id || "",
      checklist_type: item.checklist_type || item.type || "custom",
      title: item.title || readable(item.checklist_type || "custom"),
      status: item.status || "not_started",
      completed_at: item.completed_at || null,
      override_note: item.override_note || "",
    })),
    job_checklist_sections: (data.job_checklist_sections || []).map((item) => ({
      sort_order: 0,
      ...item,
      section_name: item.section_name || "",
      sort_order: Number(item.sort_order || 0),
    })),
    job_checklist_items: (data.job_checklist_items || []).map((item) => ({
      checked: false,
      checked_at: null,
      checked_by: "",
      required: true,
      notes: "",
      photo_url: "",
      issue_status: "none",
      sort_order: 0,
      ...item,
      checked: Boolean(item.checked),
      checked_at: item.checked_at || null,
      checked_by: item.checked_by || "",
      required: item.required !== false,
      notes: item.notes || "",
      photo_url: item.photo_url || "",
      issue_status: item.issue_status || "none",
      sort_order: Number(item.sort_order || 0),
    })),
  };
  ensureDefaultChecklistTemplates(normalized);
  return normalized;
}

function ensureDefaultChecklistTemplates(data) {
  const defaults = buildDefaultChecklistTemplateState();
  const existingTemplateIds = new Set((data.checklist_templates || []).map((item) => item.id));
  defaults.checklist_templates.forEach((templateItem) => {
    if (existingTemplateIds.has(templateItem.id)) return;
    data.checklist_templates.push(templateItem);
    data.checklist_template_sections.push(...defaults.checklist_template_sections.filter((section) => section.template_id === templateItem.id));
    const addedSectionIds = new Set(data.checklist_template_sections.filter((section) => section.template_id === templateItem.id).map((section) => section.id));
    data.checklist_template_items.push(...defaults.checklist_template_items.filter((item) => addedSectionIds.has(item.section_id)));
  });
}

function saveState(nextState = state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
  if (dataStore?.saveState) {
    const snapshot = JSON.parse(JSON.stringify(nextState));
    remoteSaveQueue = remoteSaveQueue
      .then(() => dataStore.saveState(snapshot))
      .catch((error) => {
        backendStatus.message = `Sync error: ${error.message}`;
        toast(backendStatus.message);
      });
  }
}

function createDataStore() {
  const config = window.RUN_LIST_CONFIG || {};
  const hasSupabaseConfig = Boolean(config.supabaseUrl && config.supabaseAnonKey);
  const hasSupabaseClient = Boolean(window.supabase?.createClient);

  if (hasSupabaseConfig && hasSupabaseClient) {
    return createSupabaseStore(config);
  }

  return {
    mode: "local",
    async load() {
      return {
        mode: "local",
        message: hasSupabaseConfig ? "Supabase client failed to load; using local storage" : "Local browser storage",
        state: loadLocalState(),
      };
    },
  };
}

function createSupabaseStore(config) {
  const client = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });

  async function requireSessionIfConfigured() {
    if (!config.requireAuth) return null;
    const { data, error } = await client.auth.getSession();
    if (error) throw error;
    return data.session;
  }

  async function loadTables() {
    const [
      suppliers,
      leads,
      jobs,
      categories,
      items,
      checklistTemplates,
      checklistTemplateSections,
      checklistTemplateItems,
      jobChecklists,
      jobChecklistSections,
      jobChecklistItems,
    ] = await Promise.all([
      client.from("suppliers").select("*").order("supplier_name"),
      client.from("leads").select("*").order("created_at", { ascending: false }),
      client.from("jobs").select("*").order("job_name"),
      client.from("categories").select("*").order("category_name"),
      client.from("items").select("*").order("created_at", { ascending: false }),
      client.from("checklist_templates").select("*").order("name"),
      client.from("checklist_template_sections").select("*").order("sort_order"),
      client.from("checklist_template_items").select("*").order("sort_order"),
      client.from("job_checklists").select("*").order("created_at", { ascending: false }),
      client.from("job_checklist_sections").select("*").order("sort_order"),
      client.from("job_checklist_items").select("*").order("sort_order"),
    ]);

    const result = {
      suppliers,
      leads,
      jobs,
      categories,
      items,
      checklist_templates: checklistTemplates,
      checklist_template_sections: checklistTemplateSections,
      checklist_template_items: checklistTemplateItems,
      job_checklists: jobChecklists,
      job_checklist_sections: jobChecklistSections,
      job_checklist_items: jobChecklistItems,
    };
    for (const key of TABLES) {
      if (result[key].error) throw result[key].error;
    }

    return normalizeState({
      suppliers: suppliers.data || [],
      leads: leads.data || [],
      jobs: jobs.data || [],
      categories: categories.data || [],
      items: items.data || [],
      checklist_templates: checklistTemplates.data || [],
      checklist_template_sections: checklistTemplateSections.data || [],
      checklist_template_items: checklistTemplateItems.data || [],
      job_checklists: jobChecklists.data || [],
      job_checklist_sections: jobChecklistSections.data || [],
      job_checklist_items: jobChecklistItems.data || [],
    });
  }

  async function seedRemoteIfNeeded(remoteState) {
    if (!config.seedRemoteOnFirstRun) return remoteState;
    const hasAnyData = TABLES.some((key) => remoteState[key]?.length);
    if (hasAnyData) return remoteState;

    const seedState = loadLocalState(false);
    await saveFullState(seedState);
    return loadTables();
  }

  async function saveFullState(nextState) {
    const normalized = normalizeState(nextState);
    await upsertRows("suppliers", normalized.suppliers.map(cleanSupplier));
    await upsertDashboardAwareRows("leads", normalized.leads.map(cleanLead));
    await upsertDashboardAwareRows("jobs", normalized.jobs.map(cleanJob));
    await upsertRows("categories", normalized.categories.map(cleanCategory));
    await upsertRows("items", normalized.items.map(cleanItem));
    await upsertRows("checklist_templates", normalized.checklist_templates.map(cleanChecklistTemplate));
    await upsertRows("checklist_template_sections", normalized.checklist_template_sections.map(cleanChecklistTemplateSection));
    await upsertRows("checklist_template_items", normalized.checklist_template_items.map(cleanChecklistTemplateItem));
    await upsertRows("job_checklists", normalized.job_checklists.map(cleanJobChecklist));
    await upsertRows("job_checklist_sections", normalized.job_checklist_sections.map(cleanJobChecklistSection));
    await upsertRows("job_checklist_items", normalized.job_checklist_items.map(cleanJobChecklistItem));
  }

  async function upsertRows(table, rows) {
    if (!rows.length) return;
    const { error } = await client.from(table).upsert(rows, { onConflict: "id" });
    if (error) throw error;
  }

  async function upsertDashboardAwareRows(table, rows) {
    if (!dashboardColumnsAvailable) {
      await upsertRows(table, rows.map(stripDashboardColumns));
      return;
    }
    try {
      await upsertRows(table, rows);
    } catch (error) {
      if (!isMissingDashboardColumnError(error)) throw error;
      dashboardColumnsAvailable = false;
      backendStatus.message = "Synced without dashboard planning fields; run supabase-dashboard-migration.sql";
      await upsertRows(table, rows.map(stripDashboardColumns));
    }
  }

  return {
    mode: "supabase",
    client,
    async load() {
      const session = await requireSessionIfConfigured();
      if (config.requireAuth && !session) {
        return {
          mode: "supabase",
          message: "Sign in to sync with Supabase",
          authRequired: true,
          state: loadLocalState(),
        };
      }

      const remoteState = await seedRemoteIfNeeded(await loadTables());
      localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteState));
      return {
        mode: "supabase",
        message: "Synced with Supabase",
        userEmail: session?.user?.email || "",
        state: remoteState,
      };
    },
    saveState: saveFullState,
    async deleteItem(id) {
      const { error } = await client.from("items").delete().eq("id", id);
      if (error) throw error;
    },
    async deleteChecklistTemplateItem(id) {
      const { error } = await client.from("checklist_template_items").delete().eq("id", id);
      if (error) throw error;
    },
    async signInWithEmail(email) {
      const { error } = await client.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${location.origin}${location.pathname}`,
        },
      });
      if (error) throw error;
    },
    async signOut() {
      const { error } = await client.auth.signOut();
      if (error) throw error;
    },
  };
}

function cleanSupplier(item) {
  return pickDefined({
    id: item.id,
    supplier_name: item.supplier_name,
    supplier_type: item.supplier_type || "",
    town: item.town || null,
    default_contact: item.default_contact || null,
    notes: item.notes || null,
    active: item.active !== false,
  });
}

function cleanLead(item) {
  return pickDefined({
    id: item.id,
    lead_name: item.lead_name || "",
    client_name: item.client_name || "",
    phone: item.phone || null,
    email: item.email || null,
    location: item.location || "",
    source: item.source || null,
    status: item.status || "new_lead",
    priority: item.priority || "normal",
    next_follow_up: item.next_follow_up || null,
    next_action: item.next_action || null,
    next_action_due_date: item.next_action_due_date || null,
    last_contacted_at: item.last_contacted_at || null,
    notes: item.notes || null,
    converted_job_id: item.converted_job_id || null,
    active: item.active !== false,
    created_at: item.created_at,
    updated_at: item.updated_at,
  });
}

function cleanJob(item) {
  return pickDefined({
    id: item.id,
    job_number: item.job_number || "",
    client_name: item.client_name || "",
    job_name: item.job_name || "",
    location: item.location || "",
    status: item.status || "active",
    priority: item.priority || "normal",
    next_action: item.next_action || null,
    next_action_due_date: item.next_action_due_date || null,
    target_install_date: item.target_install_date || null,
    active: item.active !== false,
    created_at: item.created_at,
    updated_at: item.updated_at,
  });
}

function stripDashboardColumns(row) {
  const {
    next_action,
    next_action_due_date,
    last_contacted_at,
    target_install_date,
    priority,
    ...rest
  } = row;
  if (row.priority && !("job_number" in row)) {
    rest.priority = row.priority;
  }
  return rest;
}

function isMissingDashboardColumnError(error) {
  const message = `${error?.message || ""} ${error?.details || ""} ${error?.hint || ""}`.toLowerCase();
  return ["next_action", "next_action_due_date", "last_contacted_at", "target_install_date", "priority"].some((column) => message.includes(column));
}

function cleanCategory(item) {
  return pickDefined({
    id: item.id,
    category_name: item.category_name,
    notes: item.notes || null,
  });
}

function cleanItem(item) {
  return pickDefined({
    id: item.id,
    item_name: item.item_name,
    quantity: item.quantity || "",
    unit: item.unit || "",
    supplier_id: item.supplier_id,
    job_id: item.job_id || null,
    category_id: item.category_id || null,
    type: item.type || "pickup",
    status: item.status || "needed",
    needed_by: item.needed_by || null,
    priority: item.priority || "normal",
    notes: item.notes || null,
    product_link: item.product_link || null,
    photo_url: item.photo_url || null,
    created_at: item.created_at,
    updated_at: item.updated_at,
    completed_at: item.completed_at || null,
  });
}

function cleanChecklistTemplate(item) {
  return pickDefined({
    id: item.id,
    name: item.name,
    type: item.type || "custom",
    description: item.description || null,
    active: item.active !== false,
    created_at: item.created_at,
    updated_at: item.updated_at,
  });
}

function cleanChecklistTemplateSection(item) {
  return pickDefined({
    id: item.id,
    template_id: item.template_id,
    section_name: item.section_name,
    sort_order: Number(item.sort_order || 0),
    created_at: item.created_at,
    updated_at: item.updated_at,
  });
}

function cleanChecklistTemplateItem(item) {
  return pickDefined({
    id: item.id,
    section_id: item.section_id,
    item_text: item.item_text,
    sort_order: Number(item.sort_order || 0),
    required: item.required !== false,
    default_notes: item.default_notes || null,
    allow_photo: Boolean(item.allow_photo),
    created_at: item.created_at,
    updated_at: item.updated_at,
  });
}

function cleanJobChecklist(item) {
  return pickDefined({
    id: item.id,
    job_id: item.job_id,
    template_id: item.template_id || null,
    checklist_type: item.checklist_type || "custom",
    title: item.title,
    status: item.status || "not_started",
    override_note: item.override_note || null,
    created_at: item.created_at,
    updated_at: item.updated_at,
    completed_at: item.completed_at || null,
  });
}

function cleanJobChecklistSection(item) {
  return pickDefined({
    id: item.id,
    job_checklist_id: item.job_checklist_id,
    section_name: item.section_name,
    sort_order: Number(item.sort_order || 0),
  });
}

function cleanJobChecklistItem(item) {
  return pickDefined({
    id: item.id,
    job_checklist_section_id: item.job_checklist_section_id,
    item_text: item.item_text,
    checked: Boolean(item.checked),
    checked_at: item.checked_at || null,
    checked_by: item.checked_by || null,
    required: item.required !== false,
    notes: item.notes || null,
    photo_url: item.photo_url || null,
    issue_status: item.issue_status || "none",
    sort_order: Number(item.sort_order || 0),
    created_at: item.created_at,
    updated_at: item.updated_at,
  });
}

function pickDefined(input) {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined));
}

function createItem(input) {
  const now = nowIso();
  const status = input.status || "needed";
  return {
    id: uid("item"),
    item_name: input.item_name?.trim() || "",
    quantity: input.quantity || "",
    unit: input.unit || "",
    supplier_id: input.supplier_id || "",
    job_id: input.job_id || "",
    category_id: input.category_id || "",
    type: input.type || "pickup",
    status,
    needed_by: input.needed_by || "",
    priority: input.priority || "normal",
    notes: input.notes || "",
    product_link: input.product_link || "",
    photo_url: input.photo_url || "",
    created_at: now,
    updated_at: now,
    completed_at: COMPLETED_STATUSES.has(status) ? now : null,
  };
}

function createLead(input) {
  const now = nowIso();
  return {
    id: uid("lead"),
    lead_name: input.lead_name?.trim() || input.job_name?.trim() || input.client_name?.trim() || "New lead",
    client_name: input.client_name?.trim() || "",
    phone: input.phone || "",
    email: input.email || "",
    location: input.location || "",
    source: input.source || "",
    status: input.status || "new_lead",
    priority: input.priority || "normal",
    next_follow_up: input.next_follow_up || "",
    next_action: input.next_action || "",
    next_action_due_date: input.next_action_due_date || "",
    last_contacted_at: input.last_contacted_at || "",
    notes: input.notes || "",
    converted_job_id: input.converted_job_id || "",
    active: input.active !== false,
    created_at: now,
    updated_at: now,
  };
}

function render() {
  const route = getRoute();
  document.querySelectorAll(".bottom-nav a").forEach((link) => {
    link.classList.toggle("active", route.name === link.dataset.route || route.section === link.dataset.route);
  });
  backButton.classList.toggle("hidden", route.name === "home");

  const screens = {
    home: renderHome,
    suppliers: renderSuppliers,
    supplier: () => renderSupplierDetail(route.id),
    leads: renderLeads,
    lead: () => renderLeadDetail(route.id),
    leadform: () => renderLeadForm(route.params, route.id),
    jobs: renderJobs,
    jobform: () => renderJobForm(route.params),
    job: () => renderJobDetail(route.id),
    stages: renderStages,
    checklist: () => renderChecklistDetail(route.id),
    templates: renderChecklistTemplates,
    template: () => renderTemplateEditor(route.id),
    orders: renderOrders,
    add: () => renderItemForm(route.params),
    edit: () => renderItemForm(route.params, route.id),
    history: renderHistory,
    search: renderSearch,
    settings: renderSettings,
  };

  const screen = screens[route.name] || renderHome;
  screen();
  app.focus({ preventScroll: true });
}

function renderLoading() {
  setTitle("Run List");
  app.innerHTML = empty("Loading Run List...");
}

function renderAuthScreen() {
  setTitle("Sign In");
  backButton.classList.add("hidden");
  app.innerHTML = `
    <section class="panel auth-panel">
      <h2>Sign in to Run List</h2>
      <p class="muted">Enter your email and Supabase will send a magic link. After sign-in, this app will sync the same supplier and job lists across your devices.</p>
      <form class="form-grid" id="loginForm">
        <div class="field full">
          <label>Email
            <input name="email" type="email" autocomplete="email" required />
          </label>
        </div>
        <div class="form-actions">
          <button class="primary-action" type="submit">Send link</button>
        </div>
      </form>
      <p class="muted" id="loginMessage"></p>
    </section>
  `;

  document.getElementById("loginForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const message = document.getElementById("loginMessage");
    const email = new FormData(event.currentTarget).get("email");
    message.textContent = "Sending sign-in link...";
    try {
      await dataStore.signInWithEmail(email);
      message.textContent = "Check your email for the sign-in link, then return here.";
    } catch (error) {
      message.textContent = error.message;
    }
  });
}

function renderBackendPanel() {
  const isSupabase = backendStatus.mode === "supabase";
  return `
    <section class="status-banner ${isSupabase ? "synced" : "local"}">
      <span>
        <strong>${isSupabase ? "Shared backend" : "Local mode"}</strong><br>
        <span>${escapeHtml(backendStatus.userEmail || backendStatus.message)}</span>
      </span>
      ${isSupabase ? '<button class="ghost-button" id="signOutButton" type="button">Sign out</button>' : '<a class="ghost-button" href="#/settings">Setup</a>'}
    </section>
  `;
}

function bindBackendPanel() {
  const signOutButton = document.getElementById("signOutButton");
  if (!signOutButton) return;
  signOutButton.addEventListener("click", async () => {
    await dataStore.signOut();
    backendStatus.authRequired = true;
    renderAuthScreen();
  });
}

function getRoute() {
  const hash = location.hash.replace(/^#/, "") || "/";
  const [path, queryString = ""] = hash.split("?");
  const parts = path.split("/").filter(Boolean);
  const params = Object.fromEntries(new URLSearchParams(queryString));

  if (!parts.length) return { name: "home", section: "home", params };
  if (parts[0] === "checklists" && parts[1]) return { name: "checklist", section: "jobs", id: parts[1], params };
  if (parts[0] === "templates" && parts[1]) return { name: "template", section: "templates", id: parts[1], params };
  if (parts[0] === "leads" && parts[1]) return { name: "lead", section: "leads", id: parts[1], params };
  if (parts[0] === "leadform" && parts[1]) return { name: "leadform", section: "leads", id: parts[1], params };
  if (parts[0] === "suppliers" && parts[1]) return { name: "supplier", section: "suppliers", id: parts[1], params };
  if (parts[0] === "jobs" && parts[1]) return { name: "job", section: "jobs", id: parts[1], params };
  if (parts[0] === "edit" && parts[1]) return { name: "edit", id: parts[1], params };
  return { name: parts[0], section: parts[0], params };
}

function navigate(path) {
  location.hash = `#${path}`;
}

function setTitle(value) {
  title.textContent = value;
  document.title = `${value} | Run List`;
}

function activeItems() {
  return state.items.filter((item) => !COMPLETED_STATUSES.has(item.status));
}

function completedItems() {
  return state.items.filter((item) => COMPLETED_STATUSES.has(item.status));
}

function supplierById(id) {
  return state.suppliers.find((item) => item.id === id);
}

function leadById(id) {
  return state.leads.find((item) => item.id === id);
}

function jobById(id) {
  return state.jobs.find((item) => item.id === id);
}

function categoryById(id) {
  return state.categories.find((item) => item.id === id);
}

function itemById(id) {
  return state.items.find((item) => item.id === id);
}

function activeLeads() {
  return state.leads.filter((item) => item.active !== false && !CLOSED_LEAD_STATUSES.has(item.status));
}

function closedLeads() {
  return state.leads.filter((item) => item.active === false || CLOSED_LEAD_STATUSES.has(item.status));
}

function openJobs() {
  return state.jobs.filter((item) => item.active !== false && !CLOSED_JOB_STATUSES.has(item.status));
}

function closedJobs() {
  return state.jobs.filter((item) => item.active === false || CLOSED_JOB_STATUSES.has(item.status));
}

function renderHome() {
  setTitle("Cabinet Ninja Dashboard");
  const attentionItems = dashboardAttentionItems().slice(0, 14);
  const urgentRunItems = dashboardUrgentRunItems().slice(0, 6);
  const checklistWarnings = dashboardChecklistWarnings().slice(0, 8);
  const upcomingItems = dashboardUpcomingItems().slice(0, 8);
  const activeRunItems = activeItems();

  app.innerHTML = `
    <div class="dashboard stack">
      ${renderBackendPanel()}
      <section class="dashboard-hero">
        <div>
          <p class="dashboard-date">${escapeHtml(fullDateLabel())}</p>
          <h2>What needs attention today?</h2>
        </div>
        <div class="quick-actions" aria-label="Quick actions">
          <a class="primary-action" href="#/leadform">Add Lead</a>
          <a class="ghost-button" href="#/leadform">Add Customer</a>
          <a class="ghost-button" href="#/jobform">Add Job</a>
          <a class="ghost-button" href="#/add">Add Run List Item</a>
          <a class="ghost-button" href="#/jobs">Add Checklist</a>
          <a class="ghost-button" href="#/settings">Add Supplier</a>
        </div>
      </section>

      <section class="panel attention-card">
        <div class="section-heading">
          <h2>Today / Needs Attention</h2>
          <span class="count-pill">${attentionItems.length}</span>
        </div>
        <div class="list">${renderDashboardActionList(attentionItems, "Nothing urgent right now.")}</div>
      </section>

      <div class="dashboard-grid">
        ${renderDashboardCard("Run List / Orders", "#/suppliers", `
          <div class="list">${renderSupplierOrderSummary(activeRunItems)}</div>
          <h3>Urgent pickups/orders</h3>
          <div class="list compact-dashboard-list">${renderDashboardActionList(urgentRunItems, "No urgent pickup/order items.")}</div>
        `)}
        ${renderDashboardCard("Upcoming", "#/stages", `
          <div class="list">${renderDashboardActionList(upcomingItems, "No upcoming measure-ups or installs booked.")}</div>
        `)}
        ${renderDashboardCard("Lead Pipeline", "#/leads", `
          <div class="list">${renderStatusSummary(activeLeads(), LEAD_PIPELINE_STAGES, "lead")}</div>
          <h3>Lead actions</h3>
          <div class="list compact-dashboard-list">${renderDashboardActionList(dashboardLeadActions().slice(0, 5), "No lead actions waiting.")}</div>
        `)}
        ${renderDashboardCard("Active Jobs", "#/jobs", `
          <div class="list">${renderStatusSummary(openJobs(), JOB_PIPELINE_STAGES, "job")}</div>
          <h3>Job warnings</h3>
          <div class="list compact-dashboard-list">${renderDashboardActionList(dashboardJobWarnings().slice(0, 5), "No active job warnings.")}</div>
        `)}
        ${renderDashboardCard("Checklists", "#/templates", `
          <div class="list">${renderDashboardActionList(checklistWarnings, "No checklist warnings.")}</div>
        `)}
        ${renderDashboardCard("Payment / Invoice Prompts", "#/jobs", `
          <div class="list">${renderPaymentPromptSummary()}</div>
        `)}
      </div>
    </div>
  `;
  bindBackendPanel();
}

function renderDashboardCard(titleText, href, bodyHtml) {
  return `
    <section class="panel dashboard-card">
      <div class="section-heading">
        <h2>${escapeHtml(titleText)}</h2>
        <a class="ghost-button" href="${href}">Open</a>
      </div>
      ${bodyHtml}
    </section>
  `;
}

function renderDashboardActionList(items, emptyMessage) {
  if (!items.length) return empty(emptyMessage);
  return items.map((item) => `
    <a class="list-link dashboard-alert ${escapeAttr(item.severity || "")}" href="${escapeAttr(item.href)}">
      <span>
        <span class="status-pill ${escapeAttr(item.severity || "")}">${escapeHtml(item.type)}</span>
        <strong>${escapeHtml(item.title)}</strong><br>
        <span class="muted">${escapeHtml([item.reason, item.dateLabel].filter(Boolean).join(" - "))}</span>
      </span>
      <span class="priority-pill ${escapeAttr(item.severity === "urgent" ? "urgent" : "normal")}">${escapeHtml(item.badge || "Open")}</span>
    </a>
  `).join("");
}

function renderStatusSummary(records, stages, kind) {
  const counts = stages
    .map((stage) => [stage, records.filter((item) => item.status === stage).length])
    .filter(([, count]) => count > 0);
  if (!counts.length) return empty(kind === "lead" ? "No active leads." : "No active jobs.");
  return counts.map(([stage, count]) => {
    const href = kind === "lead" ? `#/leads?status=${encodeURIComponent(stage)}` : `#/jobs?status=${encodeURIComponent(stage)}`;
    return `
      <a class="list-link compact-link" href="${href}">
        <strong>${escapeHtml(readable(stage))}</strong>
        <span class="count-pill">${count}</span>
      </a>
    `;
  }).join("");
}

function renderSupplierOrderSummary(items) {
  const rows = state.suppliers
    .filter((supplierItem) => supplierItem.active)
    .map((supplierItem) => ({
      supplier: supplierItem,
      count: items.filter((item) => item.supplier_id === supplierItem.id).length,
    }))
    .filter((row) => row.count > 0)
    .sort((a, b) => b.count - a.count || a.supplier.supplier_name.localeCompare(b.supplier.supplier_name));
  if (!rows.length) return empty("No active pickup/order items.");
  return rows.slice(0, 8).map((row) => `
    <a class="list-link compact-link" href="#/suppliers/${row.supplier.id}">
      <strong>${escapeHtml(row.supplier.supplier_name)}</strong>
      <span class="count-pill">${row.count}</span>
    </a>
  `).join("");
}

function renderPaymentPromptSummary() {
  const promptStages = ["accepted_deposit_needed", "final_invoice_due"];
  const rows = openJobs().filter((jobItem) => promptStages.includes(jobItem.status));
  if (!rows.length) return empty("No payment prompts set up right now.");
  return rows.map((jobItem) => `
    <a class="list-link" href="#/jobs/${jobItem.id}">
      <span>
        <strong>${escapeHtml(labelForJob(jobItem))}</strong><br>
        <span class="muted">${escapeHtml(jobItem.status === "accepted_deposit_needed" ? "Deposit invoice/payment needed" : "Final invoice due")}</span>
      </span>
      <span class="status-pill">${escapeHtml(readable(jobItem.status))}</span>
    </a>
  `).join("");
}

function dashboardAttentionItems() {
  return [
    ...dashboardLeadActions(),
    ...dashboardJobWarnings(),
    ...dashboardUrgentRunItems(),
    ...dashboardChecklistWarnings(),
  ].sort((a, b) => dashboardSeveritySort(a) - dashboardSeveritySort(b) || (a.sortDate || "9999-12-31").localeCompare(b.sortDate || "9999-12-31") || a.title.localeCompare(b.title));
}

function dashboardLeadActions() {
  const items = [];
  activeLeads().forEach((leadItem) => {
    const href = `#/leads/${leadItem.id}`;
    if (isDueOrOverdue(leadItem.next_action_due_date || leadItem.next_follow_up)) {
      items.push(dashboardItem("Lead", labelForLead(leadItem), dueReason("Lead action", leadItem.next_action_due_date || leadItem.next_follow_up), leadItem.next_action_due_date || leadItem.next_follow_up, href, dueSeverity(leadItem.next_action_due_date || leadItem.next_follow_up), dueBadge(leadItem.next_action_due_date || leadItem.next_follow_up)));
      return;
    }
    if (leadItem.status === "new_lead") {
      items.push(dashboardItem("Lead", labelForLead(leadItem), "New lead needs reply/action", leadItem.created_at?.slice(0, 10), href, leadItem.priority === "urgent" ? "urgent" : "warning", "New"));
      return;
    }
    if (!leadItem.next_action && !["job_accepted", "job_declined", "lost", "cancelled"].includes(leadItem.status)) {
      items.push(dashboardItem("Lead", labelForLead(leadItem), "No next action set", "", href, "warning", "Action"));
      return;
    }
    if (leadItem.priority === "urgent") {
      items.push(dashboardItem("Lead", labelForLead(leadItem), "Urgent lead", leadItem.next_follow_up, href, "urgent", "Urgent"));
    }
  });
  return items;
}

function dashboardJobWarnings() {
  const installStages = new Set(["ready_to_install", "load_into_install_trailer", "packed", "install", "installing"]);
  const qcStages = new Set(["installed", "qc_defects", "final_invoice_due"]);
  const rows = [];
  openJobs().forEach((jobItem) => {
    const href = `#/jobs/${jobItem.id}`;
    const outstanding = activeItems().filter((item) => item.job_id === jobItem.id).length;
    const packing = latestChecklistForType(jobItem.id, "packing");
    const qc = latestChecklistForType(jobItem.id, "qc_completion");
    if (isDueOrOverdue(jobItem.next_action_due_date)) {
      rows.push(dashboardItem("Job", labelForJob(jobItem), dueReason(jobItem.next_action || "Job action", jobItem.next_action_due_date), jobItem.next_action_due_date, href, dueSeverity(jobItem.next_action_due_date), dueBadge(jobItem.next_action_due_date)));
      return;
    }
    if (installStages.has(jobItem.status) && outstanding) {
      rows.push(dashboardItem("Job", labelForJob(jobItem), `${outstanding} outstanding run-list items`, jobItem.target_install_date, href, "urgent", "Blocked"));
      return;
    }
    if (isWithinDays(jobItem.target_install_date, 3) && (!packing || packing.status !== "complete")) {
      rows.push(dashboardItem("Checklist", labelForJob(jobItem), "Packing checklist incomplete before install", jobItem.target_install_date, packing ? `#/checklists/${packing.id}` : href, "warning", "Packing"));
      return;
    }
    if (qcStages.has(jobItem.status) && (!qc || qc.status !== "complete")) {
      rows.push(dashboardItem("Checklist", labelForJob(jobItem), "QC checklist incomplete", jobItem.target_install_date, qc ? `#/checklists/${qc.id}` : href, "warning", "QC"));
      return;
    }
    if (!jobItem.next_action) {
      rows.push(dashboardItem("Job", labelForJob(jobItem), "No next action set", jobItem.target_install_date, href, "warning", "Action"));
      return;
    }
    if (jobItem.priority === "urgent") {
      rows.push(dashboardItem("Job", labelForJob(jobItem), "Urgent job", jobItem.target_install_date, href, "urgent", "Urgent"));
    }
  });
  return rows;
}

function dashboardUrgentRunItems() {
  return activeItems()
    .filter((item) => item.priority === "urgent" || isDueOrOverdue(item.needed_by) || isWithinDays(item.needed_by, 3))
    .sort(sortByNeededDate)
    .map((item) => {
      const supplierItem = supplierById(item.supplier_id);
      const jobItem = jobById(item.job_id);
      const titleText = `${jobItem ? labelForJob(jobItem) : "General"}: ${item.item_name}`;
      const reason = [supplierItem?.supplier_name, readable(item.type), readable(item.status)].filter(Boolean).join(" - ");
      return dashboardItem("Order", titleText, reason, item.needed_by, `#/edit/${item.id}`, item.priority === "urgent" || isDueOrOverdue(item.needed_by) ? "urgent" : "warning", item.priority === "urgent" ? "Urgent" : dueBadge(item.needed_by));
    });
}

function dashboardChecklistWarnings() {
  const rows = [];
  openJobs().forEach((jobItem) => {
    ["packing", "qc_completion"].forEach((type) => {
      const checklist = latestChecklistForType(jobItem.id, type);
      if (!checklist) {
        if (type === "packing" && isWithinDays(jobItem.target_install_date, 7)) {
          rows.push(dashboardItem("Checklist", labelForJob(jobItem), "Packing checklist not started", jobItem.target_install_date, `#/jobs/${jobItem.id}`, "warning", "Packing"));
        }
        return;
      }
      if (checklist.status === "complete") return;
      const progress = checklistProgress(checklist.id);
      rows.push(dashboardItem("Checklist", labelForJob(jobItem), `${readable(type)} ${progress.checkedRequired}/${progress.totalRequired}`, jobItem.target_install_date, `#/checklists/${checklist.id}`, "warning", "Incomplete"));
    });
  });
  state.job_checklist_items
    .filter((item) => ["issue_found", "to_fix"].includes(item.issue_status))
    .forEach((item) => {
      const section = state.job_checklist_sections.find((candidate) => candidate.id === item.job_checklist_section_id);
      const checklist = section ? jobChecklistById(section.job_checklist_id) : null;
      const jobItem = checklist ? jobById(checklist.job_id) : null;
      if (!jobItem || CLOSED_JOB_STATUSES.has(jobItem.status)) return;
      rows.push(dashboardItem("Issue", labelForJob(jobItem), item.item_text, jobItem.target_install_date, `#/checklists/${checklist.id}`, "urgent", "Issue"));
    });
  return rows;
}

function dashboardUpcomingItems() {
  const rows = [];
  activeLeads().forEach((leadItem) => {
    if (["to_measure_up", "measure_booked"].includes(leadItem.status) && leadItem.next_action_due_date) {
      rows.push(dashboardItem("Measure-up", labelForLead(leadItem), leadItem.next_action || readable(leadItem.status), leadItem.next_action_due_date, `#/leads/${leadItem.id}`, "normal", "Lead"));
    }
  });
  openJobs().forEach((jobItem) => {
    if (jobItem.target_install_date) {
      rows.push(dashboardItem("Install", labelForJob(jobItem), readable(jobItem.status), jobItem.target_install_date, `#/jobs/${jobItem.id}`, "normal", "Job"));
    }
  });
  activeItems().filter((item) => item.needed_by && isWithinDays(item.needed_by, 7)).forEach((item) => {
    rows.push(dashboardItem(readable(item.type), item.item_name, supplierById(item.supplier_id)?.supplier_name || "Supplier", item.needed_by, `#/edit/${item.id}`, item.priority === "urgent" ? "urgent" : "normal", readable(item.type)));
  });
  return rows.sort((a, b) => (a.sortDate || "9999-12-31").localeCompare(b.sortDate || "9999-12-31"));
}

function dashboardItem(type, titleText, reason, dateValue, href, severity = "normal", badge = "Open") {
  return {
    type,
    title: titleText,
    reason,
    href,
    severity,
    badge,
    sortDate: dateValue || "9999-12-31",
    dateLabel: dateValue ? dueLabel(dateValue) : "",
  };
}

function dashboardSeveritySort(item) {
  return { urgent: 0, warning: 1, normal: 2 }[item.severity] ?? 2;
}

function homeTile(label, count, href) {
  return `
    <a class="action-tile" href="${href}">
      <strong>${escapeHtml(label)}</strong>
      <span class="tile-count">${escapeHtml(count)}</span>
    </a>
  `;
}

function metricRow(label, value) {
  return `
    <div class="list-link">
      <strong>${escapeHtml(label)}</strong>
      <span class="count-pill">${escapeHtml(String(value))}</span>
    </div>
  `;
}

function renderSuppliers() {
  setTitle("Run List");
  const rows = state.suppliers
    .filter((supplierItem) => supplierItem.active)
    .sort((a, b) => a.supplier_name.localeCompare(b.supplier_name))
    .map((supplierItem) => {
      const count = activeItems().filter((item) => item.supplier_id === supplierItem.id).length;
      return `
        <a class="list-link" href="#/suppliers/${supplierItem.id}">
          <span>
            <strong>${escapeHtml(supplierItem.supplier_name)}</strong><br>
            <span class="muted">${escapeHtml([supplierItem.supplier_type, supplierItem.town].filter(Boolean).join(" - ") || "Supplier")}</span>
          </span>
          <span class="count-pill">${count}</span>
        </a>
      `;
    })
    .join("");

  app.innerHTML = `
    <div class="stack">
      <div class="toolbar">
        <a class="primary-action" href="#/add">Add item</a>
        <a class="ghost-button" href="#/settings">Suppliers</a>
      </div>
      <section class="list">${rows || empty("No active suppliers yet.")}</section>
    </div>
  `;
}

function renderSupplierDetail(id) {
  const supplierItem = supplierById(id);
  if (!supplierItem) {
    renderNotFound("Supplier not found.");
    return;
  }
  setTitle(supplierItem.supplier_name);
  const items = activeItems()
    .filter((item) => item.supplier_id === id)
    .sort(sortByPriorityThenName);

  app.innerHTML = `
    <div class="stack">
      <div class="toolbar">
        <a class="primary-action" href="#/add?supplier_id=${encodeURIComponent(id)}">Add for ${escapeHtml(supplierItem.supplier_name)}</a>
        <button class="ghost-button" type="button" id="copySupplierList">Copy list</button>
        <a class="ghost-button" href="#/history?supplier_id=${encodeURIComponent(id)}">Completed</a>
      </div>
      <section class="list">${renderItemList(items, { showSupplier: false })}</section>
    </div>
  `;

  document.getElementById("copySupplierList").addEventListener("click", () => copySupplierList(supplierItem, items));
}

function renderLeads() {
  const params = getRoute().params;
  const showClosed = params.show === "closed";
  const statusFilter = params.status || "";
  setTitle(statusFilter ? readable(statusFilter) : showClosed ? "Closed Leads" : "Leads");
  const leads = (showClosed ? closedLeads() : activeLeads())
    .filter((leadItem) => !statusFilter || leadItem.status === statusFilter)
    .sort((a, b) => leadSortValue(a).localeCompare(leadSortValue(b)));
  const rows = leads.map((leadItem) => `
    <a class="list-link" href="#/leads/${leadItem.id}">
      <span>
        <strong>${escapeHtml(labelForLead(leadItem))}</strong><br>
        <span class="muted">${escapeHtml([readable(leadItem.status), leadItem.location, leadItem.next_follow_up ? `Follow up ${formatDate(leadItem.next_follow_up)}` : ""].filter(Boolean).join(" - "))}</span>
      </span>
      <span class="priority-pill ${escapeAttr(leadItem.priority)}">${escapeHtml(readable(leadItem.priority))}</span>
    </a>
  `).join("");

  app.innerHTML = `
    <div class="stack">
      <div class="toolbar">
        <a class="primary-action" href="#/leadform">Add lead</a>
        ${statusFilter ? '<a class="ghost-button" href="#/leads">Clear filter</a>' : ""}
        <a class="ghost-button" href="${showClosed ? "#/leads" : "#/leads?show=closed"}">${showClosed ? "Show active" : "Show closed"}</a>
      </div>
      <section class="list">${rows || empty(statusFilter ? `No active leads in ${readable(statusFilter)}.` : showClosed ? "No closed leads yet." : "No active leads yet.")}</section>
    </div>
  `;
}

function renderLeadDetail(id) {
  const leadItem = leadById(id);
  if (!leadItem) {
    renderNotFound("Lead not found.");
    return;
  }
  setTitle(labelForLead(leadItem));
  const convertedJob = jobById(leadItem.converted_job_id);
  app.innerHTML = `
    <div class="stack">
      <div class="toolbar">
        <a class="primary-action" href="#/leadform/${leadItem.id}">Edit lead</a>
        ${convertedJob ? `<a class="ghost-button" href="#/jobs/${convertedJob.id}">Open job</a>` : '<button class="ghost-button" id="convertLeadButton" type="button">Create job</button>'}
        <button class="ghost-button" id="closeLeadButton" type="button">${CLOSED_LEAD_STATUSES.has(leadItem.status) ? "Reopen lead" : "Close lead"}</button>
      </div>
      <section class="panel">
        <h2>Lead Details</h2>
        <div class="list">
          ${metricRow("Status", readable(leadItem.status))}
          ${metricRow("Priority", readable(leadItem.priority))}
          ${metricRow("Client", leadItem.client_name || "Not set")}
          ${metricRow("Phone", leadItem.phone || "Not set")}
          ${metricRow("Email", leadItem.email || "Not set")}
          ${metricRow("Location", leadItem.location || "Not set")}
          ${metricRow("Source", leadItem.source || "Not set")}
          ${metricRow("Next follow-up", leadItem.next_follow_up ? formatDate(leadItem.next_follow_up) : "Not set")}
          ${metricRow("Next action", leadItem.next_action || "Not set")}
          ${metricRow("Action due", leadItem.next_action_due_date ? formatDate(leadItem.next_action_due_date) : "Not set")}
          ${metricRow("Last contacted", leadItem.last_contacted_at ? formatDate(leadItem.last_contacted_at) : "Not set")}
        </div>
        ${leadItem.notes ? `<p class="item-notes lead-notes">${linkify(leadItem.notes)}</p>` : ""}
      </section>
    </div>
  `;

  document.getElementById("convertLeadButton")?.addEventListener("click", () => convertLeadToJob(id));
  document.getElementById("closeLeadButton").addEventListener("click", () => toggleLeadClosed(id));
}

function renderLeadForm(params = {}, id = null) {
  const editing = id ? leadById(id) : null;
  const leadItem = editing || createLead({});
  setTitle(editing ? "Edit Lead" : "Add Lead");
  app.innerHTML = `
    <form class="panel form-grid" id="leadForm">
      ${field("Lead/job name", "lead_name", "text", leadItem.lead_name, "full", true)}
      ${field("Client name", "client_name", "text", leadItem.client_name)}
      ${field("Phone", "phone", "tel", leadItem.phone)}
      ${field("Email", "email", "email", leadItem.email)}
      ${field("Location", "location", "text", leadItem.location)}
      ${field("Source", "source", "text", leadItem.source)}
      ${selectField("Status", "status", leadItem.status, LEAD_STATUS_OPTIONS)}
      ${selectField("Priority", "priority", leadItem.priority, PRIORITY_OPTIONS)}
      ${field("Next follow-up", "next_follow_up", "date", leadItem.next_follow_up)}
      ${field("Next action", "next_action", "text", leadItem.next_action, "full")}
      ${field("Action due", "next_action_due_date", "date", leadItem.next_action_due_date)}
      ${field("Last contacted", "last_contacted_at", "date", leadItem.last_contacted_at)}
      ${textareaField("Notes", "notes", leadItem.notes, "full")}
      <div class="form-actions">
        <button class="primary-action" type="submit">Save</button>
        <a class="ghost-button" href="${editing ? `#/leads/${editing.id}` : "#/leads"}">Cancel</a>
      </div>
    </form>
  `;

  document.getElementById("leadForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const nextValues = Object.fromEntries(form.entries());
    if (editing) {
      Object.assign(editing, nextValues, {
        active: !CLOSED_LEAD_STATUSES.has(nextValues.status),
        updated_at: nowIso(),
      });
      saveState();
      navigate(`/leads/${editing.id}`);
    } else {
      const nextLead = createLead(nextValues);
      nextLead.active = !CLOSED_LEAD_STATUSES.has(nextLead.status);
      state.leads.unshift(nextLead);
      saveState();
      navigate(`/leads/${nextLead.id}`);
    }
  });
}

function renderStages() {
  setTitle("Stages");
  app.innerHTML = `
    <div class="stack">
      <section>
        <div class="section-heading">
          <h2>Lead Pipeline</h2>
          <a class="ghost-button" href="#/leadform">Add lead</a>
        </div>
        ${LEAD_PIPELINE_STAGES.map((stage) => renderStageGroup(stage, state.leads.filter((leadItem) => leadItem.status === stage), "lead")).join("")}
      </section>
      <section>
        <div class="section-heading">
          <h2>Job Pipeline</h2>
          <span class="button-row">
            <a class="ghost-button" href="#/jobform">New job</a>
            <a class="ghost-button" href="#/jobs">Open jobs</a>
          </span>
        </div>
        ${JOB_PIPELINE_STAGES.map((stage) => renderStageGroup(stage, state.jobs.filter((jobItem) => jobItem.status === stage), "job")).join("")}
      </section>
    </div>
  `;
}

function renderStageGroup(stage, rows, kind) {
  const sorted = [...rows].sort((a, b) => stageRowLabel(a, kind).localeCompare(stageRowLabel(b, kind)));
  return `
    <details class="checklist-section stage-section" ${sorted.length ? "open" : ""}>
      <summary>
        <span>${escapeHtml(readable(stage))}</span>
        <span class="count-pill">${sorted.length}</span>
      </summary>
      <div class="list stage-list">
        ${sorted.map((item) => renderStageRow(item, kind)).join("") || empty("Nothing in this stage.")}
      </div>
    </details>
  `;
}

function renderStageRow(item, kind) {
  if (kind === "lead") {
    return `
      <a class="list-link" href="#/leads/${item.id}">
        <span>
          <strong>${escapeHtml(labelForLead(item))}</strong><br>
          <span class="muted">${escapeHtml([item.location, item.next_follow_up ? `Follow up ${formatDate(item.next_follow_up)}` : ""].filter(Boolean).join(" - ") || "Lead")}</span>
        </span>
        <span class="priority-pill ${escapeAttr(item.priority)}">${escapeHtml(readable(item.priority))}</span>
      </a>
    `;
  }
  const outstanding = activeItems().filter((runItem) => runItem.job_id === item.id).length;
  return `
    <a class="list-link" href="#/jobs/${item.id}">
      <span>
        <strong>${escapeHtml(labelForJob(item))}</strong><br>
        <span class="muted">${escapeHtml([item.location, outstanding ? `${outstanding} run-list items` : ""].filter(Boolean).join(" - ") || "Job")}</span>
      </span>
      <span class="count-pill">${outstanding}</span>
    </a>
  `;
}

function stageRowLabel(item, kind) {
  return kind === "lead" ? labelForLead(item) : labelForJob(item);
}

function convertLeadToJob(id) {
  const leadItem = leadById(id);
  if (!leadItem) return;
  const existingJob = jobById(leadItem.converted_job_id);
  if (existingJob) {
    navigate(`/jobs/${existingJob.id}`);
    return;
  }
  const nextJob = job(nextJobNumber(), leadItem.client_name || leadItem.lead_name, leadItem.lead_name, leadItem.location, "job_accepted");
  state.jobs.unshift(nextJob);
  Object.assign(leadItem, {
    status: "job_accepted",
    active: false,
    converted_job_id: nextJob.id,
    updated_at: nowIso(),
  });
  saveState();
  navigate(`/jobs/${nextJob.id}`);
}

function toggleLeadClosed(id) {
  const leadItem = leadById(id);
  if (!leadItem) return;
  if (CLOSED_LEAD_STATUSES.has(leadItem.status) || leadItem.active === false) {
    leadItem.status = "contacted";
    leadItem.active = true;
  } else {
    leadItem.status = "job_declined";
    leadItem.active = false;
  }
  leadItem.updated_at = nowIso();
  saveState();
  navigate("/leads");
}

function renderJobs() {
  const params = getRoute().params;
  const showClosed = params.show === "closed";
  const statusFilter = params.status || "";
  setTitle(statusFilter ? readable(statusFilter) : showClosed ? "Closed Jobs" : "Jobs");
  const jobs = (showClosed ? closedJobs() : openJobs()).filter((jobItem) => !statusFilter || jobItem.status === statusFilter);
  const rows = jobs
    .sort((a, b) => jobStageSort(a.status) - jobStageSort(b.status) || labelForJob(a).localeCompare(labelForJob(b)))
    .map((jobItem) => {
      const count = activeItems().filter((item) => item.job_id === jobItem.id).length;
      const packing = latestChecklistForType(jobItem.id, "packing");
      const qc = latestChecklistForType(jobItem.id, "qc_completion");
      const checklistMeta = [
        packing ? `Packing ${checklistProgress(packing.id).percent}%` : "Packing not started",
        qc ? `QC ${checklistProgress(qc.id).percent}%` : "QC not started",
      ].join(" - ");
      return `
        <a class="list-link" href="#/jobs/${jobItem.id}">
          <span>
            <strong>${escapeHtml(labelForJob(jobItem))}</strong><br>
            <span class="muted">${escapeHtml([readable(jobItem.status), jobItem.job_number, jobItem.location, checklistMeta].filter(Boolean).join(" - ") || "Job")}</span>
          </span>
          <span class="count-pill">${count}</span>
        </a>
      `;
    })
    .join("");

  app.innerHTML = `
    <div class="stack">
      <div class="toolbar">
        <a class="primary-action" href="#/jobform">New job</a>
        <a class="primary-action" href="#/add">Add item</a>
        <a class="ghost-button" href="#/stages">Stages</a>
        ${statusFilter ? '<a class="ghost-button" href="#/jobs">Clear filter</a>' : ""}
        <a class="ghost-button" href="${showClosed ? "#/jobs" : "#/jobs?show=closed"}">${showClosed ? "Show open" : "Show complete/cancelled"}</a>
      </div>
      <section class="list">${rows || empty(statusFilter ? `No open jobs in ${readable(statusFilter)}.` : showClosed ? "No completed or cancelled jobs yet." : "No open jobs yet.")}</section>
    </div>
  `;
}

function renderJobForm(params = {}) {
  const suggestedNumber = nextJobNumber();
  setTitle("New Job");
  app.innerHTML = `
    <form class="form-grid" id="jobCreateForm">
      <section class="panel full">
        <h2>Job Number</h2>
        <p class="muted">This job will be created as <strong>${escapeHtml(suggestedNumber)}</strong>.</p>
      </section>
      ${field("Client name", "client_name", "text", params.client || "", "full", true)}
      ${field("Job name", "job_name", "text", params.name || "", "full", true)}
      ${field("Location", "location", "text", params.location || "", "full")}
      ${selectField("Starting stage", "status", params.status || "job_accepted", JOB_STAGE_OPTIONS)}
      ${selectField("Priority", "priority", params.priority || "normal", PRIORITY_OPTIONS)}
      ${field("Target install date", "target_install_date", "date", params.target_install_date || "")}
      ${field("Next action", "next_action", "text", params.next_action || "", "full")}
      ${field("Action due", "next_action_due_date", "date", params.next_action_due_date || "")}
      <div class="form-actions full">
        <button class="primary-action" type="submit">Create job</button>
        <a class="ghost-button" href="#/jobs">Cancel</a>
      </div>
    </form>
  `;

  document.getElementById("jobCreateForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const newJob = job(
      nextJobNumber(),
      form.get("client_name"),
      form.get("job_name"),
      form.get("location"),
      form.get("status") || "job_accepted",
    );
    newJob.priority = form.get("priority") || "normal";
    newJob.target_install_date = form.get("target_install_date") || "";
    newJob.next_action = form.get("next_action") || "";
    newJob.next_action_due_date = form.get("next_action_due_date") || "";
    newJob.active = newJob.status !== "archived";
    state.jobs.unshift(newJob);
    saveState();
    navigate(`/jobs/${newJob.id}`);
  });
}

function renderJobDetail(id) {
  const jobItem = jobById(id);
  if (!jobItem) {
    renderNotFound("Job not found.");
    return;
  }
  setTitle(labelForJob(jobItem));
  const items = activeItems().filter((item) => item.job_id === id).sort(sortBySupplierThenName);
  const grouped = groupBy(items, (item) => supplierById(item.supplier_id)?.supplier_name || "No supplier");
  const qcWarning = jobNeedsQcWarning(id);

  app.innerHTML = `
    <div class="stack">
      <div class="toolbar">
        <a class="primary-action" href="#/add?job_id=${encodeURIComponent(id)}">Add for job</a>
        <a class="ghost-button" href="#/history?job_id=${encodeURIComponent(id)}">Completed</a>
        <button class="ghost-button" id="completeJobButton" type="button">${jobItem.status === "complete" ? "Reopen job" : "Mark job complete"}</button>
        <button class="ghost-button" id="cancelJobButton" type="button">${jobItem.status === "cancelled" ? "Reopen cancelled" : "Cancel job"}</button>
        <button class="ghost-button" id="archiveJobButton" type="button">${jobItem.active === false ? "Unarchive" : "Archive"}</button>
      </div>
      <section class="panel">
        <h2>Job Stage</h2>
        <form class="inline-form" id="jobStageForm">
          ${selectField("Current stage", "status", jobItem.status || "active", JOB_STAGE_OPTIONS)}
          <button class="primary-action" type="submit">Update</button>
        </form>
      </section>
      <section class="panel">
        <h2>Next Action</h2>
        <form class="form-grid" id="jobPlanningForm">
          ${selectField("Priority", "priority", jobItem.priority || "normal", PRIORITY_OPTIONS)}
          ${field("Target install date", "target_install_date", "date", jobItem.target_install_date || "")}
          ${field("Next action", "next_action", "text", jobItem.next_action || "", "full")}
          ${field("Action due", "next_action_due_date", "date", jobItem.next_action_due_date || "")}
          <div class="form-actions full">
            <button class="primary-action" type="submit">Save planning</button>
          </div>
        </form>
      </section>
      ${qcWarning ? `<section class="warning-panel"><strong>QC checklist incomplete.</strong><br><span>Complete QC or use a checklist override before marking this job complete.</span></section>` : ""}
      ${renderJobChecklistArea(id)}
      <section>
        <div class="section-heading">
          <h2>Outstanding Run List Items</h2>
          <span class="count-pill">${items.length}</span>
        </div>
      </section>
      ${Object.entries(grouped).map(([supplierName, supplierItems]) => `
        <section>
          <div class="section-heading">
            <h2>${escapeHtml(supplierName)}</h2>
            <span class="count-pill">${supplierItems.length}</span>
          </div>
          <div class="list">${renderItemList(supplierItems, { showJob: false })}</div>
        </section>
      `).join("") || empty("No outstanding items for this job.")}
    </div>
  `;

  bindJobChecklistArea(id);
  document.getElementById("jobStageForm").addEventListener("submit", (event) => {
    event.preventDefault();
    setJobStage(id, new FormData(event.currentTarget).get("status"));
  });
  document.getElementById("jobPlanningForm").addEventListener("submit", (event) => {
    event.preventDefault();
    updateJobPlanning(id, Object.fromEntries(new FormData(event.currentTarget).entries()));
  });
  document.getElementById("completeJobButton").addEventListener("click", () => toggleJobComplete(id));
  document.getElementById("cancelJobButton").addEventListener("click", () => toggleJobCancelled(id));
  document.getElementById("archiveJobButton").addEventListener("click", () => toggleJobArchived(id));
}

function renderJobChecklistArea(jobId) {
  const checklists = jobChecklistsForJob(jobId);
  const packing = latestChecklistForType(jobId, "packing");
  const qc = latestChecklistForType(jobId, "qc_completion");
  const templates = state.checklist_templates
    .filter((template) => template.active)
    .sort((a, b) => checklistTypeSort(a.type) - checklistTypeSort(b.type) || a.name.localeCompare(b.name));

  return `
    <section class="panel checklist-summary">
      <div class="section-heading">
        <h2>Checklists</h2>
        <span class="count-pill">${checklists.length}</span>
      </div>
      <div class="list">
        ${renderChecklistSummaryRow("Packing Checklist", packing, "packing")}
        ${renderChecklistSummaryRow("QC Completion Checklist", qc, "qc_completion")}
      </div>
      <form class="inline-form" id="generateChecklistForm">
        <label class="field full">Create checklist
          <select name="template_id" required>
            <option value="">Choose template</option>
            ${templates.map((template) => `<option value="${escapeAttr(template.id)}">${escapeHtml(template.name)}</option>`).join("")}
          </select>
        </label>
        <button class="primary-action" type="submit">Create</button>
      </form>
      <a class="ghost-button full-width" href="#/templates">Manage templates</a>
    </section>
  `;
}

function renderChecklistSummaryRow(label, checklist, type) {
  const progress = checklist ? checklistProgress(checklist.id) : null;
  const warning = checklist && checklist.status !== "complete" && progress.totalRequired > 0;
  return `
    <div class="list-link ${warning ? "warning-row" : ""}">
      <span>
        <strong>${escapeHtml(label)}</strong><br>
        <span class="muted">${checklist ? `${progress.checkedRequired}/${progress.totalRequired} required complete - ${readable(checklist.status)}` : "Not started"}</span>
      </span>
      ${checklist ? `<a class="ghost-button" href="#/checklists/${checklist.id}">Open</a>` : `<span class="status-pill">${escapeHtml(readable(type))}</span>`}
    </div>
  `;
}

function bindJobChecklistArea(jobId) {
  const form = document.getElementById("generateChecklistForm");
  if (!form) return;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const templateId = new FormData(form).get("template_id");
    if (!templateId) return;
    const checklist = generateChecklistFromTemplate(jobId, templateId);
    saveState();
    navigate(`/checklists/${checklist.id}`);
  });
}

function toggleJobComplete(jobId) {
  const jobItem = jobById(jobId);
  if (!jobItem) return;
  if (jobItem.status === "complete") {
    jobItem.status = "active";
    jobItem.updated_at = nowIso();
    saveState();
    render();
    return;
  }
  if (jobNeedsQcWarning(jobId)) {
    const ok = window.confirm("QC checklist is not complete. Mark this job complete anyway?");
    if (!ok) return;
  }
  jobItem.status = "complete";
  jobItem.updated_at = nowIso();
  saveState();
  navigate("/jobs");
}

function setJobStage(jobId, status) {
  const jobItem = jobById(jobId);
  if (!jobItem) return;
  jobItem.status = status || "active";
  jobItem.active = jobItem.status !== "archived";
  jobItem.updated_at = nowIso();
  saveState();
  navigate(CLOSED_JOB_STATUSES.has(jobItem.status) ? "/jobs" : `/jobs/${jobId}`);
}

function updateJobPlanning(jobId, values) {
  const jobItem = jobById(jobId);
  if (!jobItem) return;
  Object.assign(jobItem, {
    priority: values.priority || "normal",
    target_install_date: values.target_install_date || "",
    next_action: values.next_action || "",
    next_action_due_date: values.next_action_due_date || "",
    updated_at: nowIso(),
  });
  saveState();
  toast("Job planning saved.");
  render();
}

function toggleJobCancelled(jobId) {
  const jobItem = jobById(jobId);
  if (!jobItem) return;
  if (jobItem.status === "cancelled") {
    jobItem.status = "active";
    jobItem.active = true;
  } else {
    const ok = window.confirm("Move this job out of the active job list as cancelled?");
    if (!ok) return;
    jobItem.status = "cancelled";
  }
  jobItem.updated_at = nowIso();
  saveState();
  navigate("/jobs");
}

function toggleJobArchived(jobId) {
  const jobItem = jobById(jobId);
  if (!jobItem) return;
  jobItem.active = jobItem.active === false;
  jobItem.updated_at = nowIso();
  saveState();
  navigate(jobItem.active ? `/jobs/${jobId}` : "/jobs");
}

function renderChecklistDetail(id) {
  const checklist = jobChecklistById(id);
  if (!checklist) {
    renderNotFound("Checklist not found.");
    return;
  }
  const jobItem = jobById(checklist.job_id);
  const progress = checklistProgress(id);
  const sections = jobChecklistSectionsForChecklist(id);
  const outstanding = activeItems().filter((item) => item.job_id === checklist.job_id).sort(sortBySupplierThenName);
  const incompleteRequired = Math.max(0, progress.totalRequired - progress.checkedRequired);

  setTitle(checklist.title);
  app.innerHTML = `
    <div class="stack checklist-detail">
      <section class="panel">
        <p class="muted">${escapeHtml(jobItem ? labelForJob(jobItem) : "No job")}</p>
        <div class="progress-header">
          <div>
            <strong>${progress.checkedRequired}/${progress.totalRequired} required</strong><br>
            <span class="muted">${escapeHtml(readable(checklist.status))}${checklist.completed_at ? ` - completed ${formatDateTime(checklist.completed_at)}` : ""}</span>
          </div>
          <span class="count-pill">${progress.percent}%</span>
        </div>
        <div class="progress-track" aria-label="Checklist progress">
          <span style="width: ${progress.percent}%"></span>
        </div>
        ${checklist.override_note ? `<p class="override-note"><strong>Override:</strong> ${escapeHtml(checklist.override_note)}</p>` : ""}
      </section>

      ${outstanding.length ? `
        <section class="warning-panel">
          <strong>Outstanding Run List items for this job</strong>
          <div class="compact-list">
            ${outstanding.map((item) => `
              <div>${escapeHtml(item.item_name)} — ${escapeHtml(supplierById(item.supplier_id)?.supplier_name || "No supplier")} — ${escapeHtml(readable(item.status))}</div>
            `).join("")}
          </div>
        </section>
      ` : ""}

      <div class="toolbar">
        <button class="primary-action" id="completeChecklist" type="button">${checklist.status === "complete" ? "Checklist complete" : "Mark complete"}</button>
        ${incompleteRequired ? '<button class="ghost-button" id="overrideChecklist" type="button">Complete with override</button>' : ""}
        <button class="ghost-button" id="toggleCheckedItems" type="button">Hide checked</button>
      </div>

      ${sections.map((section) => renderChecklistSection(section)).join("") || empty("No checklist items yet.")}
    </div>
  `;

  bindChecklistDetail(id);
}

function renderChecklistSection(section) {
  const items = jobChecklistItemsForSection(section.id);
  const checkedCount = items.filter((item) => item.checked).length;
  return `
    <details class="checklist-section" open>
      <summary>
        <span>${escapeHtml(section.section_name)}</span>
        <span class="count-pill">${checkedCount}/${items.length}</span>
      </summary>
      <div class="checklist-items">
        ${items.map((item) => renderChecklistItem(item)).join("")}
      </div>
    </details>
  `;
}

function renderChecklistItem(item) {
  return `
    <article class="checklist-item ${item.checked ? "checked" : ""}" data-checklist-item-id="${escapeAttr(item.id)}">
      <button class="tick-button checklist-toggle" type="button" aria-label="${item.checked ? "Untick item" : "Tick item"}"></button>
      <div class="checklist-item-main">
        <div class="item-title-line">
          <h3>${escapeHtml(item.item_text)}</h3>
          ${item.required ? '<span class="status-pill">Required</span>' : '<span class="status-pill optional">Optional</span>'}
        </div>
        <div class="item-controls checklist-controls">
          <label class="field">Notes
            <textarea class="checklist-note" rows="2">${escapeHtml(item.notes || "")}</textarea>
          </label>
          <label class="field">Photo/link
            <input class="checklist-photo" type="url" value="${escapeAttr(item.photo_url || "")}" placeholder="Paste photo URL" />
          </label>
          <label class="field">Issue
            <select class="checklist-issue">
              ${ISSUE_STATUS_OPTIONS.map(([value, label]) => `<option value="${value}" ${item.issue_status === value ? "selected" : ""}>${label}</option>`).join("")}
            </select>
          </label>
        </div>
      </div>
    </article>
  `;
}

function bindChecklistDetail(checklistId) {
  document.querySelectorAll("[data-checklist-item-id]").forEach((row) => {
    const item = jobChecklistItemById(row.dataset.checklistItemId);
    if (!item) return;
    row.querySelector(".checklist-toggle").addEventListener("click", () => {
      item.checked = !item.checked;
      item.checked_at = item.checked ? nowIso() : null;
      item.checked_by = item.checked ? backendStatus.userEmail || "" : "";
      updateChecklistStatus(checklistId);
      saveState();
      renderChecklistDetail(checklistId);
    });
    row.querySelector(".checklist-note").addEventListener("change", (event) => {
      item.notes = event.target.value;
      item.updated_at = nowIso();
      saveState();
    });
    row.querySelector(".checklist-photo").addEventListener("change", (event) => {
      item.photo_url = event.target.value;
      item.updated_at = nowIso();
      saveState();
    });
    row.querySelector(".checklist-issue").addEventListener("change", (event) => {
      item.issue_status = event.target.value;
      item.updated_at = nowIso();
      saveState();
    });
  });

  document.getElementById("completeChecklist")?.addEventListener("click", () => completeChecklist(checklistId, false));
  document.getElementById("overrideChecklist")?.addEventListener("click", () => completeChecklist(checklistId, true));
  document.getElementById("toggleCheckedItems")?.addEventListener("click", (event) => {
    app.classList.toggle("hide-checked-items");
    event.currentTarget.textContent = app.classList.contains("hide-checked-items") ? "Show checked" : "Hide checked";
  });
}

function completeChecklist(checklistId, override) {
  const checklist = jobChecklistById(checklistId);
  if (!checklist) return;
  const progress = checklistProgress(checklistId);
  if (progress.checkedRequired < progress.totalRequired && !override) {
    toast("Required items are still unchecked.");
    return;
  }
  if (override && progress.checkedRequired < progress.totalRequired) {
    const note = window.prompt("Override note required", checklist.override_note || "");
    if (!note?.trim()) return;
    checklist.override_note = note.trim();
  }
  checklist.status = "complete";
  checklist.completed_at = checklist.completed_at || nowIso();
  checklist.updated_at = nowIso();
  saveState();
  renderChecklistDetail(checklistId);
}

function generateChecklistFromTemplate(jobId, templateId) {
  const template = checklistTemplateById(templateId);
  if (!template) throw new Error("Template not found.");
  const now = nowIso();
  const checklist = {
    id: uid("jcl"),
    job_id: jobId,
    template_id: template.id,
    checklist_type: template.type,
    title: template.name,
    status: "not_started",
    override_note: "",
    created_at: now,
    updated_at: now,
    completed_at: null,
  };
  state.job_checklists.unshift(checklist);

  templateSectionsForTemplate(template.id).forEach((templateSection) => {
    const section = {
      id: uid("jsec"),
      job_checklist_id: checklist.id,
      section_name: templateSection.section_name,
      sort_order: templateSection.sort_order,
    };
    state.job_checklist_sections.push(section);
    templateItemsForSection(templateSection.id).forEach((templateItem) => {
      state.job_checklist_items.push({
        id: uid("jci"),
        job_checklist_section_id: section.id,
        item_text: templateItem.item_text,
        checked: false,
        checked_at: null,
        checked_by: "",
        required: templateItem.required !== false,
        notes: templateItem.default_notes || "",
        photo_url: "",
        issue_status: "none",
        sort_order: templateItem.sort_order,
        created_at: now,
        updated_at: now,
      });
    });
  });

  return checklist;
}

function updateChecklistStatus(checklistId) {
  const checklist = jobChecklistById(checklistId);
  if (!checklist) return;
  const items = jobChecklistItemsForChecklist(checklistId);
  const progress = checklistProgress(checklistId);
  const anyChecked = items.some((item) => item.checked);
  checklist.status = progress.totalRequired > 0 && progress.checkedRequired >= progress.totalRequired
    ? "complete"
    : anyChecked ? "in_progress" : "not_started";
  checklist.completed_at = checklist.status === "complete" ? checklist.completed_at || nowIso() : null;
  if (checklist.status !== "complete") checklist.override_note = "";
  checklist.updated_at = nowIso();
}

function checklistProgress(checklistId) {
  const items = jobChecklistItemsForChecklist(checklistId);
  const required = items.filter((item) => item.required);
  const totalRequired = required.length;
  const checkedRequired = required.filter((item) => item.checked).length;
  const percent = totalRequired ? Math.round((checkedRequired / totalRequired) * 100) : 100;
  return {
    totalRequired,
    checkedRequired,
    totalItems: items.length,
    checkedItems: items.filter((item) => item.checked).length,
    percent,
  };
}

function jobNeedsQcWarning(jobId) {
  const qc = latestChecklistForType(jobId, "qc_completion");
  return !qc || qc.status !== "complete";
}

function checklistTypeSort(type) {
  return { packing: 0, qc_completion: 1, site_arrival: 2, build_readiness: 3, measure_up: 4, delivery: 5, custom: 6 }[type] ?? 99;
}

function checklistTemplateById(id) {
  return state.checklist_templates.find((item) => item.id === id);
}

function jobChecklistById(id) {
  return state.job_checklists.find((item) => item.id === id);
}

function jobChecklistItemById(id) {
  return state.job_checklist_items.find((item) => item.id === id);
}

function templateSectionsForTemplate(templateId) {
  return state.checklist_template_sections
    .filter((item) => item.template_id === templateId)
    .sort((a, b) => a.sort_order - b.sort_order || a.section_name.localeCompare(b.section_name));
}

function templateItemsForSection(sectionId) {
  return state.checklist_template_items
    .filter((item) => item.section_id === sectionId)
    .sort((a, b) => a.sort_order - b.sort_order || a.item_text.localeCompare(b.item_text));
}

function jobChecklistsForJob(jobId) {
  return state.job_checklists
    .filter((item) => item.job_id === jobId && item.status !== "archived")
    .sort((a, b) => checklistTypeSort(a.checklist_type) - checklistTypeSort(b.checklist_type) || (b.created_at || "").localeCompare(a.created_at || ""));
}

function latestChecklistForType(jobId, type) {
  return jobChecklistsForJob(jobId).find((item) => item.checklist_type === type);
}

function jobChecklistSectionsForChecklist(checklistId) {
  return state.job_checklist_sections
    .filter((item) => item.job_checklist_id === checklistId)
    .sort((a, b) => a.sort_order - b.sort_order || a.section_name.localeCompare(b.section_name));
}

function jobChecklistItemsForSection(sectionId) {
  return state.job_checklist_items
    .filter((item) => item.job_checklist_section_id === sectionId)
    .sort((a, b) => a.sort_order - b.sort_order || a.item_text.localeCompare(b.item_text));
}

function jobChecklistItemsForChecklist(checklistId) {
  const sectionIds = new Set(jobChecklistSectionsForChecklist(checklistId).map((section) => section.id));
  return state.job_checklist_items.filter((item) => sectionIds.has(item.job_checklist_section_id));
}

function renderChecklistTemplates() {
  setTitle("Checklist Templates");
  const templates = state.checklist_templates
    .sort((a, b) => checklistTypeSort(a.type) - checklistTypeSort(b.type) || a.name.localeCompare(b.name));
  app.innerHTML = `
    <div class="stack">
      <section class="panel">
        <h2>Create Template</h2>
        <form class="form-grid" id="templateCreateForm">
          ${field("Template name", "name", "text", "", "full", true)}
          ${selectField("Type", "type", "custom", CHECKLIST_TYPE_OPTIONS)}
          ${textareaField("Description", "description", "", "full")}
          <div class="form-actions">
            <button class="primary-action" type="submit">Create</button>
          </div>
        </form>
      </section>
      <section class="list">
        ${templates.map((template) => {
          const sectionCount = templateSectionsForTemplate(template.id).length;
          const itemCount = templateSectionsForTemplate(template.id).reduce((count, section) => count + templateItemsForSection(section.id).length, 0);
          return `
            <a class="list-link" href="#/templates/${template.id}">
              <span>
                <strong>${escapeHtml(template.name)}</strong><br>
                <span class="muted">${escapeHtml(readable(template.type))} - ${sectionCount} sections - ${itemCount} items${template.active ? "" : " - hidden"}</span>
              </span>
              <span class="count-pill">${itemCount}</span>
            </a>
          `;
        }).join("") || empty("No templates yet.")}
      </section>
    </div>
  `;

  document.getElementById("templateCreateForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const template = checklistTemplate(uid("tmpl"), form.get("name"), form.get("type"), form.get("description"));
    state.checklist_templates.push(template);
    saveState();
    navigate(`/templates/${template.id}`);
  });
}

function renderTemplateEditor(id) {
  const template = checklistTemplateById(id);
  if (!template) {
    renderNotFound("Template not found.");
    return;
  }
  setTitle("Edit Template");
  const sections = templateSectionsForTemplate(id);
  app.innerHTML = `
    <div class="stack">
      <section class="panel">
        <form class="form-grid" id="templateEditForm">
          ${field("Template name", "name", "text", template.name, "full", true)}
          ${selectField("Type", "type", template.type, CHECKLIST_TYPE_OPTIONS)}
          ${textareaField("Description", "description", template.description, "full")}
          <label class="field">Status
            <select name="active">
              <option value="true" ${template.active ? "selected" : ""}>Active</option>
              <option value="false" ${!template.active ? "selected" : ""}>Hidden</option>
            </select>
          </label>
          <div class="form-actions">
            <button class="primary-action" type="submit">Save</button>
            <a class="ghost-button" href="#/templates">Back</a>
          </div>
        </form>
      </section>

      <section class="panel">
        <h2>Add Section</h2>
        <form class="inline-form" id="sectionCreateForm">
          <label class="field full">Section name
            <input name="section_name" required />
          </label>
          <button class="primary-action" type="submit">Add</button>
        </form>
      </section>

      ${sections.map((section) => renderTemplateSectionEditor(section)).join("") || empty("Add a section to start building this template.")}
    </div>
  `;

  bindTemplateEditor(id);
}

function renderTemplateSectionEditor(section) {
  const items = templateItemsForSection(section.id);
  return `
    <section class="panel template-section" data-template-section-id="${escapeAttr(section.id)}">
      <div class="section-heading">
        <h2>${escapeHtml(section.section_name)}</h2>
        <span class="count-pill">${items.length}</span>
      </div>
      <div class="compact-list">
        ${items.map((item) => `
          <div class="template-item-line" data-template-item-id="${escapeAttr(item.id)}">
            <span>${escapeHtml(item.item_text)}${item.required ? "" : " (optional)"}</span>
            <button class="plain-button remove-template-item" type="button">Remove</button>
          </div>
        `).join("") || '<p class="muted">No items in this section yet.</p>'}
      </div>
      <form class="inline-form add-template-item-form">
        <label class="field full">Item
          <input name="item_text" required />
        </label>
        <label class="field checkbox-field">
          <input name="required" type="checkbox" checked />
          Required
        </label>
        <label class="field checkbox-field">
          <input name="allow_photo" type="checkbox" />
          Photo useful
        </label>
        <button class="primary-action" type="submit">Add item</button>
      </form>
    </section>
  `;
}

function bindTemplateEditor(templateId) {
  document.getElementById("templateEditForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const template = checklistTemplateById(templateId);
    const form = new FormData(event.currentTarget);
    Object.assign(template, {
      name: form.get("name").trim(),
      type: form.get("type"),
      description: form.get("description"),
      active: form.get("active") === "true",
      updated_at: nowIso(),
    });
    saveState();
    renderTemplateEditor(templateId);
  });

  document.getElementById("sectionCreateForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const sortOrder = templateSectionsForTemplate(templateId).length + 1;
    state.checklist_template_sections.push(checklistTemplateSection(uid("tsec"), templateId, form.get("section_name").trim(), sortOrder));
    saveState();
    renderTemplateEditor(templateId);
  });

  document.querySelectorAll(".add-template-item-form").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const section = form.closest("[data-template-section-id]");
      const sectionId = section.dataset.templateSectionId;
      const formData = new FormData(form);
      const sortOrder = templateItemsForSection(sectionId).length + 1;
      state.checklist_template_items.push(checklistTemplateItem(uid("titem"), sectionId, formData.get("item_text").trim(), sortOrder, {
        required: formData.has("required"),
        allow_photo: formData.has("allow_photo"),
      }));
      saveState();
      renderTemplateEditor(templateId);
    });
  });

  document.querySelectorAll(".remove-template-item").forEach((button) => {
    button.addEventListener("click", async () => {
      const row = button.closest("[data-template-item-id]");
      const id = row.dataset.templateItemId;
      state.checklist_template_items = state.checklist_template_items.filter((item) => item.id !== id);
      if (dataStore?.deleteChecklistTemplateItem) {
        try {
          await dataStore.deleteChecklistTemplateItem(id);
        } catch (error) {
          backendStatus.message = `Delete sync error: ${error.message}`;
          toast(backendStatus.message);
        }
      }
      saveState();
      renderTemplateEditor(templateId);
    });
  });
}

function renderOrders() {
  setTitle("Orders");
  const groups = {
    "Still to order": activeItems().filter((item) => item.type === "order" && item.status === "needed"),
    "Ordered, waiting": activeItems().filter((item) => item.status === "ordered"),
    "Ready to collect": activeItems().filter((item) => item.status === "ready_to_collect"),
    "Pickup needed": activeItems().filter((item) => item.type === "pickup" && item.status === "needed"),
    "Needed before install": activeItems().filter((item) => item.needed_by),
  };

  app.innerHTML = `
    <div class="stack">
      ${Object.entries(groups).map(([heading, items]) => `
        <section>
          <div class="section-heading">
            <h2>${escapeHtml(heading)}</h2>
            <span class="count-pill">${items.length}</span>
          </div>
          <div class="list">${items.length ? renderItemList(items.sort(sortByNeededDate)) : empty("Nothing here.")}</div>
        </section>
      `).join("")}
    </div>
  `;
}

function renderSearch() {
  setTitle("Search");
  const params = new URLSearchParams(location.hash.split("?")[1] || "");
  const query = params.get("q") || "";
  const results = query ? searchItems(query, state.items) : [];
  const leadResults = query ? searchLeads(query) : [];

  app.innerHTML = `
    <div class="stack">
      <form class="search-row" id="searchForm">
        <input id="searchInput" type="search" value="${escapeAttr(query)}" placeholder="Search item, supplier, job, notes" autocomplete="off" />
        <button class="primary-action" type="submit">Search</button>
      </form>
      ${query ? `
        <section>
          <div class="section-heading">
            <h2>Leads</h2>
            <span class="count-pill">${leadResults.length}</span>
          </div>
          <div class="list">
            ${leadResults.length ? leadResults.map((leadItem) => `
              <a class="list-link" href="#/leads/${leadItem.id}">
                <span>
                  <strong>${escapeHtml(labelForLead(leadItem))}</strong><br>
                  <span class="muted">${escapeHtml([readable(leadItem.status), leadItem.location, leadItem.phone, leadItem.email].filter(Boolean).join(" - "))}</span>
                </span>
                <span class="priority-pill ${escapeAttr(leadItem.priority)}">${escapeHtml(readable(leadItem.priority))}</span>
              </a>
            `).join("") : empty("No matching leads.")}
          </div>
        </section>
      ` : ""}
      <section>
        <div class="section-heading">
          <h2>Run List Items</h2>
          <span class="count-pill">${results.length}</span>
        </div>
      <section class="list">
        ${query ? renderItemList(results, { includeCompleted: true }) : empty("Enter a search term.")}
      </section>
      </section>
    </div>
  `;
  document.getElementById("searchForm").addEventListener("submit", (event) => {
    event.preventDefault();
    navigate(`/search?q=${encodeURIComponent(document.getElementById("searchInput").value.trim())}`);
  });
}

function renderHistory() {
  setTitle("History");
  const params = getRoute().params;
  let items = completedItems();
  if (params.supplier_id) items = items.filter((item) => item.supplier_id === params.supplier_id);
  if (params.job_id) items = items.filter((item) => item.job_id === params.job_id);
  items = items.sort((a, b) => (b.completed_at || "").localeCompare(a.completed_at || ""));
  let checklists = state.job_checklists.filter((item) => item.status === "complete");
  if (params.job_id) checklists = checklists.filter((item) => item.job_id === params.job_id);
  checklists = checklists.sort((a, b) => (b.completed_at || "").localeCompare(a.completed_at || ""));

  app.innerHTML = `
    <div class="stack">
      <section>
        <div class="section-heading">
          <h2>Completed Checklists</h2>
          <span class="count-pill">${checklists.length}</span>
        </div>
        <div class="list">
          ${checklists.length ? checklists.map((checklist) => `
            <a class="list-link" href="#/checklists/${checklist.id}">
              <span>
                <strong>${escapeHtml(checklist.title)}</strong><br>
                <span class="muted">${escapeHtml(jobById(checklist.job_id) ? labelForJob(jobById(checklist.job_id)) : "No job")} - ${escapeHtml(formatDateTime(checklist.completed_at))}</span>
              </span>
              <span class="status-pill">${escapeHtml(readable(checklist.checklist_type))}</span>
            </a>
          `).join("") : empty("No completed checklists yet.")}
        </div>
      </section>
      <section>
        <div class="section-heading">
          <h2>Completed Run List Items</h2>
          <span class="count-pill">${items.length}</span>
        </div>
      <section class="list">
        ${items.length ? renderItemList(items, { includeCompleted: true }) : empty("No completed items yet.")}
      </section>
      </section>
    </div>
  `;
}

function renderSettings() {
  setTitle("Suppliers");
  const rows = state.suppliers
    .sort((a, b) => a.supplier_name.localeCompare(b.supplier_name))
    .map((supplierItem) => `
      <div class="list-link">
        <span>
          <strong>${escapeHtml(supplierItem.supplier_name)}</strong><br>
          <span class="muted">${escapeHtml([supplierItem.supplier_type, supplierItem.town].filter(Boolean).join(" - ") || "Supplier")}</span>
        </span>
        <button class="ghost-button toggle-supplier" data-id="${supplierItem.id}" type="button">${supplierItem.active ? "Active" : "Hidden"}</button>
      </div>
    `)
    .join("");

  app.innerHTML = `
    <div class="stack">
      ${renderBackendPanel()}
      <section class="panel">
        <h2>Backend Setup</h2>
        <p class="muted">Create a Supabase project, run <strong>supabase-schema.sql</strong> in the SQL editor, then put the project URL and anon/publishable key into <strong>run-list-config.js</strong>. Keep <strong>requireAuth</strong> on for the shared workshop version.</p>
      </section>
    </div>
    <div class="two-col">
      <section class="panel">
        <h2>Add Supplier</h2>
        <form class="supplier-form" id="supplierForm">
          <div class="field"><label>Name<input name="supplier_name" required /></label></div>
          <div class="field"><label>Type<input name="supplier_type" placeholder="Hardware, panels, timber" /></label></div>
          <div class="field"><label>Town/location<input name="town" /></label></div>
          <button class="primary-action" type="submit">Save supplier</button>
        </form>
      </section>
      <section class="list">${rows}</section>
    </div>
  `;
  bindBackendPanel();

  document.getElementById("supplierForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    state.suppliers.push({
      ...supplier(form.get("supplier_name"), form.get("supplier_type"), form.get("town")),
      notes: "",
      default_contact: "",
    });
    saveState();
    renderSettings();
  });

  document.querySelectorAll(".toggle-supplier").forEach((button) => {
    button.addEventListener("click", () => {
      const supplierItem = supplierById(button.dataset.id);
      supplierItem.active = !supplierItem.active;
      saveState();
      renderSettings();
    });
  });
}

function renderItemForm(params = {}, id = null) {
  const editing = id ? itemById(id) : null;
  const item = editing || createItem({
    supplier_id: params.supplier_id || "",
    job_id: params.job_id || "",
  });
  setTitle(editing ? "Edit Item" : "Add Item");

  app.innerHTML = `
    <form class="panel form-grid" id="itemForm">
      ${field("Item name", "item_name", "text", item.item_name, "full", true)}
      ${field("Quantity", "quantity", "text", item.quantity)}
      ${field("Unit", "unit", "text", item.unit)}
      ${selectField("Supplier/store", "supplier_id", item.supplier_id, state.suppliers.filter((item) => item.active).map((item) => [item.id, item.supplier_name]), true)}
      ${selectField("Job", "job_id", item.job_id, [["", "General"], ...state.jobs.filter((jobItem) => jobItem.active).map((jobItem) => [jobItem.id, labelForJob(jobItem)])])}
      ${selectField("Category", "category_id", item.category_id, [["", "None"], ...state.categories.map((item) => [item.id, item.category_name])])}
      ${selectField("Type", "type", item.type, TYPE_OPTIONS)}
      ${selectField("Status", "status", item.status, STATUS_OPTIONS)}
      ${field("Needed by", "needed_by", "date", item.needed_by)}
      ${selectField("Priority", "priority", item.priority, PRIORITY_OPTIONS)}
      ${field("Product link", "product_link", "url", item.product_link, "full")}
      ${textareaField("Notes", "notes", item.notes, "full")}
      <div class="form-actions">
        <button class="primary-action" type="submit">Save</button>
        ${editing ? '<button class="danger-button" id="deleteItem" type="button">Delete</button>' : '<a class="ghost-button" href="#/">Cancel</a>'}
      </div>
    </form>
  `;

  document.getElementById("itemForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const nextValues = Object.fromEntries(form.entries());
    if (editing) {
      const wasComplete = COMPLETED_STATUSES.has(editing.status);
      Object.assign(editing, nextValues, {
        updated_at: nowIso(),
        completed_at: completionTime(nextValues.status, wasComplete ? editing.completed_at : null),
      });
    } else {
      state.items.unshift(createItem(nextValues));
    }
    saveState();
    const supplierId = nextValues.supplier_id;
    navigate(supplierId ? `/suppliers/${supplierId}` : "/suppliers");
  });

  const deleteButton = document.getElementById("deleteItem");
  if (deleteButton) {
    deleteButton.addEventListener("click", async () => {
      state.items = state.items.filter((candidate) => candidate.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      if (dataStore?.deleteItem) {
        try {
          await dataStore.deleteItem(id);
        } catch (error) {
          backendStatus.message = `Delete sync error: ${error.message}`;
          toast(backendStatus.message);
        }
      }
      saveState();
      navigate("/suppliers");
    });
  }
}

function field(label, name, type, value, extraClass = "", required = false) {
  return `
    <div class="field ${extraClass}">
      <label>${escapeHtml(label)}
        <input name="${name}" type="${type}" value="${escapeAttr(value || "")}" ${required ? "required" : ""} />
      </label>
    </div>
  `;
}

function textareaField(label, name, value, extraClass = "") {
  return `
    <div class="field ${extraClass}">
      <label>${escapeHtml(label)}
        <textarea name="${name}">${escapeHtml(value || "")}</textarea>
      </label>
    </div>
  `;
}

function selectField(label, name, value, options, required = false) {
  return `
    <div class="field">
      <label>${escapeHtml(label)}
        <select name="${name}" ${required ? "required" : ""}>
          ${options.map(([optionValue, optionLabel]) => `
            <option value="${escapeAttr(optionValue)}" ${String(value) === String(optionValue) ? "selected" : ""}>${escapeHtml(optionLabel)}</option>
          `).join("")}
        </select>
      </label>
    </div>
  `;
}

function renderItemList(items, options = {}) {
  if (!items.length) return empty("No items.");
  const html = items.map((item) => renderItemCard(item, options)).join("");
  setTimeout(() => items.forEach((item) => bindItemControls(item.id)), 0);
  return html;
}

function renderItemCard(item, options = {}) {
  const supplierItem = supplierById(item.supplier_id);
  const jobItem = jobById(item.job_id);
  const categoryItem = categoryById(item.category_id);
  const quantity = [item.quantity, item.unit].filter(Boolean).join(" ");
  const metaParts = [
    quantity,
    options.showSupplier === false ? "" : supplierItem?.supplier_name,
    options.showJob === false ? "" : jobItem ? labelForJob(jobItem) : "General",
    readable(item.type),
    readable(item.status),
    item.needed_by ? `Needed ${formatDate(item.needed_by)}` : "",
    categoryItem?.category_name,
  ].filter(Boolean);
  const completed = COMPLETED_STATUSES.has(item.status);

  return `
    <article class="item-row ${completed ? "completed" : ""}" data-item-id="${item.id}">
      <button class="tick-button complete-item" type="button" aria-label="${completed ? "Reopen item" : "Mark complete"}"></button>
      <div class="item-main">
        <div class="item-title-line">
          <h3>${escapeHtml(item.item_name)}</h3>
          <span class="priority-pill ${escapeAttr(item.priority)}">${escapeHtml(readable(item.priority))}</span>
        </div>
        <p class="item-meta">${escapeHtml(metaParts.join(" - "))}</p>
        <p class="item-notes">${linkify(item.notes || "")}</p>
        <div class="item-controls">
          <select class="status-select" aria-label="Item status">
            ${STATUS_OPTIONS.map(([value, label]) => `<option value="${value}" ${item.status === value ? "selected" : ""}>${label}</option>`).join("")}
          </select>
          <button class="ghost-button edit-item" type="button">Edit</button>
        </div>
      </div>
    </article>
  `;
}

function bindItemControls(id) {
  const item = itemById(id);
  if (!item) return;
  document.querySelectorAll(`[data-item-id="${cssEscape(id)}"]`).forEach((row) => {
    if (row.dataset.bound) return;
    row.dataset.bound = "true";
    row.querySelector(".complete-item").addEventListener("click", () => {
      if (COMPLETED_STATUSES.has(item.status)) {
        setItemStatus(id, "needed");
      } else {
        setItemStatus(id, item.type === "pickup" ? "picked_up" : "done");
      }
    });
    row.querySelector(".status-select").addEventListener("change", (event) => {
      setItemStatus(id, event.target.value);
    });
    row.querySelector(".edit-item").addEventListener("click", () => navigate(`/edit/${id}`));
  });
}

function setItemStatus(id, status) {
  const item = itemById(id);
  if (!item) return;
  item.status = status;
  item.updated_at = nowIso();
  item.completed_at = completionTime(status, item.completed_at);
  saveState();
  render();
}

function completionTime(status, existing) {
  if (COMPLETED_STATUSES.has(status)) return existing || nowIso();
  return null;
}

function copySupplierList(supplierItem, items) {
  const text = [
    `Supplier: ${supplierItem.supplier_name}`,
    "",
    ...items.map((item) => {
      const jobItem = jobById(item.job_id);
      const quantity = [item.quantity, item.unit].filter(Boolean).join(" ");
      return `- ${quantity ? `${quantity} ` : ""}${item.item_name}${jobItem ? ` (${labelForJob(jobItem)})` : ""}${item.notes ? ` - ${item.notes}` : ""}`;
    }),
  ].join("\n");

  navigator.clipboard?.writeText(text).then(() => {
    toast("Supplier list copied.");
  }).catch(() => {
    window.prompt("Copy supplier list", text);
  });
}

function toast(message) {
  const node = document.createElement("div");
  node.className = "empty";
  node.style.position = "fixed";
  node.style.right = "14px";
  node.style.bottom = "88px";
  node.style.zIndex = "50";
  node.textContent = message;
  document.body.append(node);
  setTimeout(() => node.remove(), 1800);
}

function searchItems(query, items) {
  const term = query.toLowerCase();
  return items.filter((item) => {
    const haystack = [
      item.item_name,
      item.notes,
      item.quantity,
      item.unit,
      supplierById(item.supplier_id)?.supplier_name,
      jobById(item.job_id)?.job_name,
      jobById(item.job_id)?.client_name,
      categoryById(item.category_id)?.category_name,
      readable(item.status),
      readable(item.type),
    ].join(" ").toLowerCase();
    return haystack.includes(term);
  });
}

function searchLeads(query) {
  const term = query.toLowerCase();
  return state.leads.filter((leadItem) => {
    const haystack = [
      leadItem.lead_name,
      leadItem.client_name,
      leadItem.phone,
      leadItem.email,
      leadItem.location,
      leadItem.source,
      leadItem.notes,
      readable(leadItem.status),
    ].join(" ").toLowerCase();
    return haystack.includes(term);
  });
}

function renderNotFound(message) {
  setTitle("Not Found");
  app.innerHTML = empty(message);
}

function empty(message) {
  return `<div class="empty">${escapeHtml(message)}</div>`;
}

function labelForJob(jobItem) {
  return [jobItem.job_number, jobItem.job_name || jobItem.client_name].filter(Boolean).join(" ");
}

function nextJobNumber() {
  const pattern = new RegExp(`^${JOB_NUMBER_PREFIX}-(\\d+)$`, "i");
  const highest = state.jobs.reduce((max, jobItem) => {
    const match = String(jobItem.job_number || "").match(pattern);
    if (!match) return max;
    return Math.max(max, Number(match[1]) || 0);
  }, 0);
  return `${JOB_NUMBER_PREFIX}-${String(highest + 1).padStart(JOB_NUMBER_PAD, "0")}`;
}

function labelForLead(leadItem) {
  return [leadItem.lead_name, leadItem.client_name && leadItem.client_name !== leadItem.lead_name ? leadItem.client_name : ""].filter(Boolean).join(" - ");
}

function leadSortValue(leadItem) {
  const date = leadItem.next_follow_up || "9999-12-31";
  const priority = { urgent: "0", normal: "1", low: "2" }[leadItem.priority] || "1";
  return `${leadStageSort(leadItem.status)}-${date}-${priority}-${labelForLead(leadItem).toLowerCase()}`;
}

function leadStageSort(status) {
  const index = LEAD_PIPELINE_STAGES.indexOf(status || "");
  return index === -1 ? 99 : index;
}

function jobStageSort(status) {
  const index = JOB_PIPELINE_STAGES.indexOf(status || "");
  return index === -1 ? 99 : index;
}

function readable(value) {
  return String(value || "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

function fullDateLabel() {
  return new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });
}

function localDateKey(offsetDays = 0) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + offsetDays);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isDueOrOverdue(value) {
  return Boolean(value && value <= localDateKey());
}

function isWithinDays(value, days) {
  return Boolean(value && value >= localDateKey() && value <= localDateKey(days));
}

function dueLabel(value) {
  if (!value) return "";
  if (value < localDateKey()) return `Overdue ${formatDate(value)}`;
  if (value === localDateKey()) return "Due today";
  if (value === localDateKey(1)) return "Due tomorrow";
  return formatDate(value);
}

function dueBadge(value) {
  if (!value) return "Open";
  if (value < localDateKey()) return "Overdue";
  if (value === localDateKey()) return "Today";
  return "Soon";
}

function dueSeverity(value) {
  return value && value <= localDateKey() ? "urgent" : "warning";
}

function dueReason(label, value) {
  return `${label} ${value && value < localDateKey() ? "overdue" : "due"}`;
}

function formatDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function sortByPriorityThenName(a, b) {
  const priority = { urgent: 0, normal: 1, low: 2 };
  return (priority[a.priority] ?? 1) - (priority[b.priority] ?? 1) || a.item_name.localeCompare(b.item_name);
}

function sortBySupplierThenName(a, b) {
  const supplierA = supplierById(a.supplier_id)?.supplier_name || "";
  const supplierB = supplierById(b.supplier_id)?.supplier_name || "";
  return supplierA.localeCompare(supplierB) || a.item_name.localeCompare(b.item_name);
}

function sortByNeededDate(a, b) {
  return (a.needed_by || "9999").localeCompare(b.needed_by || "9999") || sortByPriorityThenName(a, b);
}

function groupBy(items, getKey) {
  return items.reduce((groups, item) => {
    const key = getKey(item);
    groups[key] ||= [];
    groups[key].push(item);
    return groups;
  }, {});
}

function cssEscape(value) {
  if (window.CSS && typeof window.CSS.escape === "function") {
    return window.CSS.escape(value);
  }
  return String(value).replace(/[^a-zA-Z0-9_-]/g, "\\$&");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value);
}

function linkify(value) {
  return escapeHtml(value).replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noreferrer">$1</a>');
}
