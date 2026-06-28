const STORAGE_KEY = "cabinet-ninja-run-list-v1";
const TABLES = [
  "suppliers",
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

let state = { suppliers: [], jobs: [], categories: [], items: [] };
let dataStore = null;
let backendStatus = {
  mode: "local",
  message: "Local browser storage",
  userEmail: "",
};
let remoteSaveQueue = Promise.resolve();

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
    created_at: now,
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
    jobs: (data.jobs || []).map((item) => ({
      job_number: "",
      client_name: "",
      job_name: "",
      location: "",
      status: "active",
      active: true,
      ...item,
      job_number: item.job_number || "",
      client_name: item.client_name || "",
      job_name: item.job_name || "",
      location: item.location || "",
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
    await upsertRows("jobs", normalized.jobs.map(cleanJob));
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

function cleanJob(item) {
  return pickDefined({
    id: item.id,
    job_number: item.job_number || "",
    client_name: item.client_name || "",
    job_name: item.job_name || "",
    location: item.location || "",
    status: item.status || "active",
    active: item.active !== false,
    created_at: item.created_at,
  });
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
    jobs: renderJobs,
    job: () => renderJobDetail(route.id),
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

function jobById(id) {
  return state.jobs.find((item) => item.id === id);
}

function categoryById(id) {
  return state.categories.find((item) => item.id === id);
}

function itemById(id) {
  return state.items.find((item) => item.id === id);
}

function renderHome() {
  setTitle("Run List");
  const neededCount = activeItems().length;
  const supplierCount = state.suppliers.filter((supplierItem) => supplierItem.active).length;
  const orderedCount = activeItems().filter((item) => item.status === "ordered").length;
  const readyCount = activeItems().filter((item) => item.status === "ready_to_collect").length;

  app.innerHTML = `
    <div class="stack">
      ${renderBackendPanel()}
      <section class="grid-actions" aria-label="Main sections">
        ${homeTile("Run List by Supplier", `${neededCount} active`, "#/suppliers")}
        ${homeTile("Orders", `${orderedCount} waiting`, "#/orders")}
        ${homeTile("Jobs", "Materials by job", "#/jobs")}
        ${homeTile("Add Item", "Quick entry", "#/add")}
        ${homeTile("Search", "Find anything", "#/search")}
        ${homeTile("Checklist Templates", "Packing and QC", "#/templates")}
      </section>

      <section class="panel">
        <h2>Today</h2>
        <div class="list">
          ${metricRow("Active items", neededCount)}
          ${metricRow("Ready to collect", readyCount)}
          ${metricRow("Active suppliers", supplierCount)}
        </div>
      </section>

      <section>
        <div class="section-heading">
          <h2>Pickup Needed</h2>
          <a class="ghost-button" href="#/suppliers">Suppliers</a>
        </div>
        <div class="list">${renderItemList(activeItems().filter((item) => item.type === "pickup").slice(0, 6))}</div>
      </section>
    </div>
  `;
  bindBackendPanel();
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

function renderJobs() {
  setTitle("Jobs");
  const rows = state.jobs
    .filter((jobItem) => jobItem.active)
    .sort((a, b) => labelForJob(a).localeCompare(labelForJob(b)))
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
            <span class="muted">${escapeHtml([jobItem.job_number, jobItem.location, checklistMeta].filter(Boolean).join(" - ") || "Job")}</span>
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
      </div>
      <section class="list">${rows || empty("No active jobs yet.")}</section>
    </div>
  `;
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
      </div>
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
  document.getElementById("completeJobButton").addEventListener("click", () => toggleJobComplete(id));
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
  render();
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

  app.innerHTML = `
    <div class="stack">
      <form class="search-row" id="searchForm">
        <input id="searchInput" type="search" value="${escapeAttr(query)}" placeholder="Search item, supplier, job, notes" autocomplete="off" />
        <button class="primary-action" type="submit">Search</button>
      </form>
      <section class="list">
        ${query ? renderItemList(results, { includeCompleted: true }) : empty("Enter a search term.")}
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
