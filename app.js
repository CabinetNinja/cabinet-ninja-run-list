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
  "job_files",
  "cut_patterns",
  "cut_pattern_revisions",
  "cut_runs",
  "cut_part_suggestions",
  "remake_requests",
  "activity_history",
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

const CNC_FILE_EXTENSIONS = new Set(["nc", "cnc", "tap", "gcode"]);
const CUT_PATTERN_STATUS_OPTIONS = [
  ["files_incomplete", "Files incomplete"],
  ["ready_for_cnc", "Ready for CNC"],
  ["cutting", "Cutting"],
  ["partially_cut", "Partially cut"],
  ["cut_complete", "Cut complete"],
  ["problem", "Problem"],
  ["superseded", "Superseded"],
  ["cancelled", "Cancelled"],
];

const REMAKE_STATUS_OPTIONS = [
  ["requested", "Requested"],
  ["waiting_to_add_to_mozaik", "Waiting to add to Mozaik"],
  ["added_to_mozaik", "Added to Mozaik"],
  ["waiting_for_updated_files", "Waiting for updated files"],
  ["ready_for_cnc", "Ready for CNC"],
  ["cut", "Cut"],
  ["edge_banding", "Edge banding"],
  ["quality_check", "Quality check"],
  ["returned_to_job", "Returned to job"],
  ["cancelled", "Cancelled"],
];

const REMAKE_REASON_OPTIONS = [
  ["damaged_during_cnc_cutting", "Damaged during CNC cutting"],
  ["incorrect_dimensions", "Incorrect dimensions"],
  ["edge_bander_damage", "Edge bander damage"],
  ["assembly_damage", "Assembly damage"],
  ["packing_damage", "Packing damage"],
  ["transport_damage", "Transport damage"],
  ["installation_damage", "Installation damage"],
  ["material_defect", "Material defect"],
  ["missing_part", "Missing part"],
  ["design_change", "Design change"],
  ["customer_change", "Customer change"],
  ["other", "Other"],
];

const DAMAGE_STAGE_OPTIONS = [
  ["cnc", "CNC"],
  ["edge_banding", "Edge Banding"],
  ["assembly", "Assembly"],
  ["packing", "Packing"],
  ["transport", "Transport"],
  ["installation", "Installation"],
  ["unknown", "Unknown"],
];

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
  job_files: [],
  cut_patterns: [],
  cut_pattern_revisions: [],
  cut_runs: [],
  cut_part_suggestions: [],
  remake_requests: [],
  activity_history: [],
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
let workshopTablesAvailable = true;
let dymoLabelState = { labels: [], sheetFilter: "all", includeSeparators: true, edgeOrder: "left,top,right,bottom" };
let pdfJsModule = null;

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
    job_files: (data.job_files || []).map((item) => ({
      job_id: "",
      storage_path: "",
      file_url: "",
      file_kind: "",
      original_filename: "",
      internal_filename: "",
      file_hash: "",
      file_size: 0,
      mime_type: "",
      imported_at: "",
      imported_by: "",
      source: "manual_upload",
      notes: "",
      is_superseded: false,
      ...item,
      job_id: item.job_id || "",
      storage_path: item.storage_path || "",
      file_url: item.file_url || "",
      file_kind: item.file_kind || "",
      original_filename: item.original_filename || "",
      internal_filename: item.internal_filename || "",
      file_hash: item.file_hash || "",
      file_size: Number(item.file_size || 0),
      mime_type: item.mime_type || "",
      imported_at: item.imported_at || "",
      imported_by: item.imported_by || "",
      source: item.source || "manual_upload",
      notes: item.notes || "",
      is_superseded: Boolean(item.is_superseded),
    })),
    cut_patterns: (data.cut_patterns || []).map((item) => ({
      job_id: "",
      material_code: "",
      material_description: "",
      thickness: "",
      pattern_number: "",
      current_revision_id: "",
      status: "files_incomplete",
      created_at: "",
      updated_at: "",
      ...item,
      job_id: item.job_id || "",
      material_code: item.material_code || "",
      material_description: item.material_description || "",
      thickness: item.thickness || "",
      pattern_number: normalizePatternNumber(item.pattern_number || "S01"),
      current_revision_id: item.current_revision_id || "",
      status: item.status || "files_incomplete",
    })),
    cut_pattern_revisions: (data.cut_pattern_revisions || []).map((item) => ({
      cut_pattern_id: "",
      job_id: "",
      filename_revision: "R01",
      internal_revision: 1,
      required_run_quantity: 1,
      completed_run_quantity: 0,
      pdf_file_id: "",
      nc_file_id: "",
      pdf_filename: "",
      nc_filename: "",
      file_hash_pdf: "",
      file_hash_nc: "",
      is_current: true,
      is_superseded: false,
      imported_at: "",
      imported_by: "",
      revision_notes: "",
      production_status: "files_incomplete",
      review_required: false,
      review_reason: "",
      created_at: "",
      updated_at: "",
      ...item,
      cut_pattern_id: item.cut_pattern_id || "",
      job_id: item.job_id || "",
      filename_revision: normalizeRevisionNumber(item.filename_revision || "R01"),
      internal_revision: Number(item.internal_revision || 1),
      required_run_quantity: Number(item.required_run_quantity || 1),
      completed_run_quantity: Number(item.completed_run_quantity || 0),
      pdf_file_id: item.pdf_file_id || "",
      nc_file_id: item.nc_file_id || "",
      pdf_filename: item.pdf_filename || "",
      nc_filename: item.nc_filename || "",
      file_hash_pdf: item.file_hash_pdf || "",
      file_hash_nc: item.file_hash_nc || "",
      is_current: item.is_current !== false,
      is_superseded: Boolean(item.is_superseded),
      imported_at: item.imported_at || "",
      imported_by: item.imported_by || "",
      revision_notes: item.revision_notes || "",
      production_status: item.production_status || "files_incomplete",
      review_required: Boolean(item.review_required),
      review_reason: item.review_reason || "",
    })),
    cut_runs: (data.cut_runs || []).map((item) => ({
      cut_pattern_revision_id: "",
      run_number: 0,
      status: "complete",
      started_at: "",
      started_by: "",
      completed_at: "",
      completed_by: "",
      notes: "",
      has_problem: false,
      created_at: "",
      updated_at: "",
      ...item,
      cut_pattern_revision_id: item.cut_pattern_revision_id || "",
      run_number: Number(item.run_number || 0),
      status: item.status || "complete",
      started_at: item.started_at || "",
      started_by: item.started_by || "",
      completed_at: item.completed_at || "",
      completed_by: item.completed_by || "",
      notes: item.notes || "",
      has_problem: Boolean(item.has_problem),
    })),
    cut_part_suggestions: (data.cut_part_suggestions || []).map((item) => ({
      cut_pattern_revision_id: "",
      source_part_number: "",
      part_name: "",
      width: "",
      length: "",
      banding: "",
      cabinet_number: "",
      comment: "",
      pdf_page_number: "",
      raw_text: "",
      created_at: "",
      updated_at: "",
      ...item,
      cut_pattern_revision_id: item.cut_pattern_revision_id || "",
      source_part_number: item.source_part_number || "",
      part_name: item.part_name || "",
      width: item.width || "",
      length: item.length || "",
      banding: item.banding || "",
      cabinet_number: item.cabinet_number || "",
      comment: item.comment || "",
      pdf_page_number: item.pdf_page_number || "",
      raw_text: item.raw_text || "",
    })),
    remake_requests: (data.remake_requests || []).map((item) => ({
      job_id: "",
      source_cut_pattern_revision_id: "",
      destination_cut_pattern_revision_id: "",
      source_part_suggestion_id: "",
      part_number: "",
      part_name: "",
      description: "",
      cabinet_number: "",
      quantity: 1,
      material_code: "",
      material_description: "",
      thickness: "",
      width: "",
      length: "",
      banding: "",
      reason: "other",
      damage_stage: "unknown",
      notes: "",
      priority: "normal",
      required_by: "",
      status: "waiting_to_add_to_mozaik",
      assigned_person: "",
      requested_by: "",
      requested_at: "",
      added_to_mozaik_at: "",
      cut_confirmed_at: "",
      cut_confirmed_by: "",
      quality_checked_at: "",
      returned_to_job_at: "",
      photo_url: "",
      created_at: "",
      updated_at: "",
      ...item,
      job_id: item.job_id || "",
      source_cut_pattern_revision_id: item.source_cut_pattern_revision_id || "",
      destination_cut_pattern_revision_id: item.destination_cut_pattern_revision_id || "",
      source_part_suggestion_id: item.source_part_suggestion_id || "",
      part_number: item.part_number || "",
      part_name: item.part_name || "",
      description: item.description || "",
      cabinet_number: item.cabinet_number || "",
      quantity: Number(item.quantity || 1),
      material_code: item.material_code || "",
      material_description: item.material_description || "",
      thickness: item.thickness || "",
      width: item.width || "",
      length: item.length || "",
      banding: item.banding || "",
      reason: item.reason || "other",
      damage_stage: item.damage_stage || "unknown",
      notes: item.notes || "",
      priority: item.priority || "normal",
      required_by: item.required_by || "",
      status: item.status || "waiting_to_add_to_mozaik",
      assigned_person: item.assigned_person || "",
      requested_by: item.requested_by || "",
      requested_at: item.requested_at || "",
      added_to_mozaik_at: item.added_to_mozaik_at || "",
      cut_confirmed_at: item.cut_confirmed_at || "",
      cut_confirmed_by: item.cut_confirmed_by || "",
      quality_checked_at: item.quality_checked_at || "",
      returned_to_job_at: item.returned_to_job_at || "",
      photo_url: item.photo_url || "",
    })),
    activity_history: (data.activity_history || []).map((item) => ({
      job_id: "",
      entity_type: "",
      entity_id: "",
      action: "",
      user_email: "",
      happened_at: "",
      previous_value: "",
      new_value: "",
      reason: "",
      notes: "",
      ...item,
      job_id: item.job_id || "",
      entity_type: item.entity_type || "",
      entity_id: item.entity_id || "",
      action: item.action || "",
      user_email: item.user_email || "",
      happened_at: item.happened_at || "",
      previous_value: item.previous_value || "",
      new_value: item.new_value || "",
      reason: item.reason || "",
      notes: item.notes || "",
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

  async function optionalWorkshopQuery(query) {
    const result = await query;
    if (!result.error) return result;
    if (!isMissingWorkshopTableError(result.error)) throw result.error;
    workshopTablesAvailable = false;
    backendStatus.message = "Synced without Workshop/CNC tables; run supabase-workshop-cnc-migration.sql";
    return { data: [], error: null };
  }

  async function loadTables() {
    workshopTablesAvailable = true;
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
      jobFiles,
      cutPatterns,
      cutPatternRevisions,
      cutRuns,
      cutPartSuggestions,
      remakeRequests,
      activityHistory,
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
      optionalWorkshopQuery(client.from("job_files").select("*").order("imported_at", { ascending: false })),
      optionalWorkshopQuery(client.from("cut_patterns").select("*").order("updated_at", { ascending: false })),
      optionalWorkshopQuery(client.from("cut_pattern_revisions").select("*").order("imported_at", { ascending: false })),
      optionalWorkshopQuery(client.from("cut_runs").select("*").order("completed_at", { ascending: false })),
      optionalWorkshopQuery(client.from("cut_part_suggestions").select("*").order("created_at", { ascending: false })),
      optionalWorkshopQuery(client.from("remake_requests").select("*").order("created_at", { ascending: false })),
      optionalWorkshopQuery(client.from("activity_history").select("*").order("happened_at", { ascending: false }).limit(400)),
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
      job_files: jobFiles,
      cut_patterns: cutPatterns,
      cut_pattern_revisions: cutPatternRevisions,
      cut_runs: cutRuns,
      cut_part_suggestions: cutPartSuggestions,
      remake_requests: remakeRequests,
      activity_history: activityHistory,
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
      job_files: jobFiles.data || [],
      cut_patterns: cutPatterns.data || [],
      cut_pattern_revisions: cutPatternRevisions.data || [],
      cut_runs: cutRuns.data || [],
      cut_part_suggestions: cutPartSuggestions.data || [],
      remake_requests: remakeRequests.data || [],
      activity_history: activityHistory.data || [],
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
    if (workshopTablesAvailable) {
      await upsertRows("job_files", normalized.job_files.map(cleanJobFile));
      await upsertRows("cut_patterns", normalized.cut_patterns.map(cleanCutPattern));
      await upsertRows("cut_pattern_revisions", normalized.cut_pattern_revisions.map(cleanCutPatternRevision));
      await upsertRows("cut_runs", normalized.cut_runs.map(cleanCutRun));
      await upsertRows("cut_part_suggestions", normalized.cut_part_suggestions.map(cleanCutPartSuggestion));
      await upsertRows("remake_requests", normalized.remake_requests.map(cleanRemakeRequest));
      await upsertRows("activity_history", normalized.activity_history.map(cleanActivityHistory));
    }
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
        message: workshopTablesAvailable ? "Synced with Supabase" : backendStatus.message,
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
    async deleteJobFile(id) {
      const { error } = await client.from("job_files").delete().eq("id", id);
      if (error) throw error;
    },
    async uploadJobFile(path, file) {
      if (!workshopTablesAvailable) throw new Error("Run supabase-workshop-cnc-migration.sql before uploading workshop files.");
      const { error } = await client.storage.from("job-files").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (error) throw error;
      const { data } = client.storage.from("job-files").getPublicUrl(path);
      return data?.publicUrl || "";
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

function isMissingWorkshopTableError(error) {
  const message = `${error?.message || ""} ${error?.details || ""} ${error?.hint || ""}`.toLowerCase();
  return [
    "job_files",
    "cut_patterns",
    "cut_pattern_revisions",
    "cut_runs",
    "cut_part_suggestions",
    "remake_requests",
    "activity_history",
    "does not exist",
    "schema cache",
  ].some((part) => message.includes(part));
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

function cleanJobFile(item) {
  return pickDefined({
    id: item.id,
    job_id: item.job_id,
    storage_path: item.storage_path || null,
    file_url: item.file_url || null,
    file_kind: item.file_kind || "",
    original_filename: item.original_filename || "",
    internal_filename: item.internal_filename || "",
    file_hash: item.file_hash || "",
    file_size: Number(item.file_size || 0),
    mime_type: item.mime_type || null,
    imported_at: item.imported_at,
    imported_by: item.imported_by || null,
    source: item.source || "manual_upload",
    notes: item.notes || null,
    is_superseded: Boolean(item.is_superseded),
  });
}

function cleanCutPattern(item) {
  return pickDefined({
    id: item.id,
    job_id: item.job_id,
    material_code: item.material_code || "",
    material_description: item.material_description || "",
    thickness: item.thickness || "",
    pattern_number: item.pattern_number || "",
    current_revision_id: item.current_revision_id || null,
    status: item.status || "files_incomplete",
    created_at: item.created_at,
    updated_at: item.updated_at,
  });
}

function cleanCutPatternRevision(item) {
  return pickDefined({
    id: item.id,
    cut_pattern_id: item.cut_pattern_id,
    job_id: item.job_id,
    filename_revision: item.filename_revision || "R01",
    internal_revision: Number(item.internal_revision || 1),
    required_run_quantity: Number(item.required_run_quantity || 1),
    completed_run_quantity: Number(item.completed_run_quantity || 0),
    pdf_file_id: item.pdf_file_id || null,
    nc_file_id: item.nc_file_id || null,
    pdf_filename: item.pdf_filename || null,
    nc_filename: item.nc_filename || null,
    file_hash_pdf: item.file_hash_pdf || null,
    file_hash_nc: item.file_hash_nc || null,
    is_current: item.is_current !== false,
    is_superseded: Boolean(item.is_superseded),
    imported_at: item.imported_at,
    imported_by: item.imported_by || null,
    revision_notes: item.revision_notes || null,
    production_status: item.production_status || "files_incomplete",
    review_required: Boolean(item.review_required),
    review_reason: item.review_reason || null,
    created_at: item.created_at,
    updated_at: item.updated_at,
  });
}

function cleanCutRun(item) {
  return pickDefined({
    id: item.id,
    cut_pattern_revision_id: item.cut_pattern_revision_id,
    run_number: Number(item.run_number || 0),
    status: item.status || "complete",
    started_at: item.started_at || null,
    started_by: item.started_by || null,
    completed_at: item.completed_at || null,
    completed_by: item.completed_by || null,
    notes: item.notes || null,
    has_problem: Boolean(item.has_problem),
    created_at: item.created_at,
    updated_at: item.updated_at,
  });
}

function cleanCutPartSuggestion(item) {
  return pickDefined({
    id: item.id,
    cut_pattern_revision_id: item.cut_pattern_revision_id,
    source_part_number: item.source_part_number || null,
    part_name: item.part_name || null,
    width: item.width || null,
    length: item.length || null,
    banding: item.banding || null,
    cabinet_number: item.cabinet_number || null,
    comment: item.comment || null,
    pdf_page_number: item.pdf_page_number || null,
    raw_text: item.raw_text || null,
    created_at: item.created_at,
    updated_at: item.updated_at,
  });
}

function cleanRemakeRequest(item) {
  return pickDefined({
    id: item.id,
    job_id: item.job_id,
    source_cut_pattern_revision_id: item.source_cut_pattern_revision_id || null,
    destination_cut_pattern_revision_id: item.destination_cut_pattern_revision_id || null,
    source_part_suggestion_id: item.source_part_suggestion_id || null,
    part_number: item.part_number || null,
    part_name: item.part_name || null,
    description: item.description || null,
    cabinet_number: item.cabinet_number || null,
    quantity: Number(item.quantity || 1),
    material_code: item.material_code || null,
    material_description: item.material_description || null,
    thickness: item.thickness || null,
    width: item.width || null,
    length: item.length || null,
    banding: item.banding || null,
    reason: item.reason || "other",
    damage_stage: item.damage_stage || "unknown",
    notes: item.notes || null,
    priority: item.priority || "normal",
    required_by: item.required_by || null,
    status: item.status || "waiting_to_add_to_mozaik",
    assigned_person: item.assigned_person || null,
    requested_by: item.requested_by || null,
    requested_at: item.requested_at,
    added_to_mozaik_at: item.added_to_mozaik_at || null,
    cut_confirmed_at: item.cut_confirmed_at || null,
    cut_confirmed_by: item.cut_confirmed_by || null,
    quality_checked_at: item.quality_checked_at || null,
    returned_to_job_at: item.returned_to_job_at || null,
    photo_url: item.photo_url || null,
    created_at: item.created_at,
    updated_at: item.updated_at,
  });
}

function cleanActivityHistory(item) {
  return pickDefined({
    id: item.id,
    job_id: item.job_id || null,
    entity_type: item.entity_type || "",
    entity_id: item.entity_id || null,
    action: item.action || "",
    user_email: item.user_email || null,
    happened_at: item.happened_at,
    previous_value: item.previous_value || null,
    new_value: item.new_value || null,
    reason: item.reason || null,
    notes: item.notes || null,
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

function createJobFile(input) {
  const now = nowIso();
  return {
    id: uid("file"),
    job_id: input.job_id || "",
    storage_path: input.storage_path || "",
    file_url: input.file_url || "",
    file_kind: input.file_kind || "",
    original_filename: input.original_filename || "",
    internal_filename: input.internal_filename || "",
    file_hash: input.file_hash || "",
    file_size: Number(input.file_size || 0),
    mime_type: input.mime_type || "",
    imported_at: input.imported_at || now,
    imported_by: input.imported_by || backendStatus.userEmail || "",
    source: input.source || "manual_upload",
    notes: input.notes || "",
    is_superseded: Boolean(input.is_superseded),
    created_at: now,
    updated_at: now,
  };
}

function createCutPattern(input) {
  const now = nowIso();
  return {
    id: uid("pattern"),
    job_id: input.job_id || "",
    material_code: (input.material_code || "").toUpperCase(),
    material_description: input.material_description || materialDescriptionFromCode(input.material_code),
    thickness: input.thickness || thicknessFromMaterialCode(input.material_code),
    pattern_number: normalizePatternNumber(input.pattern_number || "S01"),
    current_revision_id: input.current_revision_id || "",
    status: input.status || "files_incomplete",
    created_at: now,
    updated_at: now,
  };
}

function createCutPatternRevision(input) {
  const now = nowIso();
  return {
    id: uid("revision"),
    cut_pattern_id: input.cut_pattern_id || "",
    job_id: input.job_id || "",
    filename_revision: normalizeRevisionNumber(input.filename_revision || "R01"),
    internal_revision: Number(input.internal_revision || 1),
    required_run_quantity: Number(input.required_run_quantity || 1),
    completed_run_quantity: Number(input.completed_run_quantity || 0),
    pdf_file_id: input.pdf_file_id || "",
    nc_file_id: input.nc_file_id || "",
    pdf_filename: input.pdf_filename || "",
    nc_filename: input.nc_filename || "",
    file_hash_pdf: input.file_hash_pdf || "",
    file_hash_nc: input.file_hash_nc || "",
    is_current: input.is_current !== false,
    is_superseded: Boolean(input.is_superseded),
    imported_at: input.imported_at || now,
    imported_by: input.imported_by || backendStatus.userEmail || "",
    revision_notes: input.revision_notes || "",
    production_status: input.production_status || "files_incomplete",
    review_required: Boolean(input.review_required),
    review_reason: input.review_reason || "",
    created_at: now,
    updated_at: now,
  };
}

function createCutRun(input) {
  const now = nowIso();
  return {
    id: uid("run"),
    cut_pattern_revision_id: input.cut_pattern_revision_id || "",
    run_number: Number(input.run_number || 0),
    status: input.status || "complete",
    started_at: input.started_at || "",
    started_by: input.started_by || "",
    completed_at: input.completed_at || now,
    completed_by: input.completed_by || backendStatus.userEmail || "",
    notes: input.notes || "",
    has_problem: Boolean(input.has_problem),
    created_at: now,
    updated_at: now,
  };
}

function createRemakeRequest(input) {
  const now = nowIso();
  return {
    id: uid("remake"),
    job_id: input.job_id || "",
    source_cut_pattern_revision_id: input.source_cut_pattern_revision_id || "",
    destination_cut_pattern_revision_id: input.destination_cut_pattern_revision_id || "",
    source_part_suggestion_id: input.source_part_suggestion_id || "",
    part_number: input.part_number || "",
    part_name: input.part_name || "",
    description: input.description || "",
    cabinet_number: input.cabinet_number || "",
    quantity: Number(input.quantity || 1),
    material_code: input.material_code || "",
    material_description: input.material_description || "",
    thickness: input.thickness || "",
    width: input.width || "",
    length: input.length || "",
    banding: input.banding || "",
    reason: input.reason || "other",
    damage_stage: input.damage_stage || "unknown",
    notes: input.notes || "",
    priority: input.priority || "normal",
    required_by: input.required_by || "",
    status: input.status || "waiting_to_add_to_mozaik",
    assigned_person: input.assigned_person || "",
    requested_by: input.requested_by || backendStatus.userEmail || "",
    requested_at: input.requested_at || now,
    added_to_mozaik_at: input.added_to_mozaik_at || "",
    cut_confirmed_at: input.cut_confirmed_at || "",
    cut_confirmed_by: input.cut_confirmed_by || "",
    quality_checked_at: input.quality_checked_at || "",
    returned_to_job_at: input.returned_to_job_at || "",
    photo_url: input.photo_url || "",
    created_at: now,
    updated_at: now,
  };
}

function logActivity(jobId, entityType, entityId, action, previousValue = "", newValue = "", reason = "", notes = "") {
  state.activity_history.unshift({
    id: uid("activity"),
    job_id: jobId || "",
    entity_type: entityType || "",
    entity_id: entityId || "",
    action,
    user_email: backendStatus.userEmail || "",
    happened_at: nowIso(),
    previous_value: previousValue || "",
    new_value: newValue || "",
    reason: reason || "",
    notes: notes || "",
  });
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
    workshop: renderWorkshopDashboard,
    cutting: () => renderCuttingModeScreen(route.id),
    cutimport: () => renderCutImportForm(route.params),
    folderimport: () => renderMaterialFolderImportForm(route.params),
    dymolabels: () => renderDymoLabelPrintForm(route.params),
    remakeform: () => renderRemakeForm(route.params, route.id),
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
  if (parts[0] === "remakeform" && parts[1]) return { name: "remakeform", section: "workshop", id: parts[1], params };
  if (parts[0] === "cutting" && parts[1]) return { name: "cutting", section: "workshop", id: parts[1], params };
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

function jobFileById(id) {
  return state.job_files.find((item) => item.id === id);
}

function cutRevisionsUsingFile(fileId, fileKind = "") {
  if (!fileId) return [];
  return state.cut_pattern_revisions.filter((revision) => {
    if (fileKind === "pdf") return revision.pdf_file_id === fileId;
    if (fileKind === "nc") return revision.nc_file_id === fileId;
    return revision.pdf_file_id === fileId || revision.nc_file_id === fileId;
  });
}

function pdfUsageSummary(fileId) {
  const revisions = cutRevisionsUsingFile(fileId, "pdf");
  const patternIds = [...new Set(revisions.map((revision) => revision.cut_pattern_id).filter(Boolean))];
  const patternLabels = patternIds
    .map((patternId) => cutPatternById(patternId))
    .filter(Boolean)
    .map((pattern) => `${pattern.material_code || "Material"} ${pattern.pattern_number || "Pattern"}`);
  return {
    revisions,
    patternIds,
    patternLabels,
    patternCount: patternIds.length,
  };
}

function renderPdfUsageNote(file) {
  if (!file) return "";
  const usage = pdfUsageSummary(file.id);
  if (usage.patternCount <= 1) return "";
  return `<span class="status-pill">Shared PDF - likely all cut sheets (${usage.patternCount} patterns)</span>`;
}

function cutPatternById(id) {
  return state.cut_patterns.find((item) => item.id === id);
}

function cutRevisionById(id) {
  return state.cut_pattern_revisions.find((item) => item.id === id);
}

function remakeById(id) {
  return state.remake_requests.find((item) => item.id === id);
}

function cutPatternsForJob(jobId) {
  return state.cut_patterns
    .filter((item) => item.job_id === jobId)
    .sort((a, b) => `${a.material_code}-${a.pattern_number}`.localeCompare(`${b.material_code}-${b.pattern_number}`));
}

function cutRevisionsForPattern(patternId) {
  return state.cut_pattern_revisions
    .filter((item) => item.cut_pattern_id === patternId)
    .sort((a, b) => Number(b.is_current) - Number(a.is_current) || Number(b.internal_revision) - Number(a.internal_revision));
}

function currentCutRevisionForPattern(patternId) {
  return state.cut_pattern_revisions.find((item) => item.cut_pattern_id === patternId && item.is_current && !item.is_superseded);
}

function cutRunsForRevision(revisionId) {
  return state.cut_runs
    .filter((item) => item.cut_pattern_revision_id === revisionId)
    .sort((a, b) => Number(a.run_number) - Number(b.run_number));
}

function remakesForJob(jobId) {
  return state.remake_requests
    .filter((item) => item.job_id === jobId)
    .sort((a, b) => (a.required_by || "9999").localeCompare(b.required_by || "9999") || (a.requested_at || "").localeCompare(b.requested_at || ""));
}

function openRemakes() {
  return state.remake_requests.filter((item) => !["returned_to_job", "cancelled"].includes(item.status));
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
        ${renderDashboardCard("Workshop / CNC", "#/workshop", `
          <div class="list">${renderWorkshopDashboardSummary()}</div>
          <h3>Workshop warnings</h3>
          <div class="list compact-dashboard-list">${renderDashboardActionList(dashboardWorkshopWarnings().slice(0, 5), "No workshop warnings.")}</div>
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
    ...dashboardWorkshopWarnings(),
    ...dashboardUrgentRunItems(),
    ...dashboardChecklistWarnings(),
  ].sort((a, b) => dashboardSeveritySort(a) - dashboardSeveritySort(b) || (a.sortDate || "9999-12-31").localeCompare(b.sortDate || "9999-12-31") || a.title.localeCompare(b.title));
}

function renderWorkshopDashboardSummary() {
  const queue = currentWorkshopQueue();
  const remaining = queue.reduce((total, item) => total + Math.max(0, item.revision.required_run_quantity - item.revision.completed_run_quantity), 0);
  const rows = [
    ["Patterns ready", queue.filter((item) => item.revision.production_status === "ready_for_cnc").length],
    ["Physical sheets remaining", remaining],
    ["Open remakes", openRemakes().length],
  ];
  return rows.map(([label, count]) => `
    <a class="list-link compact-link" href="#/workshop">
      <strong>${escapeHtml(label)}</strong>
      <span class="count-pill">${count}</span>
    </a>
  `).join("");
}

function dashboardWorkshopWarnings() {
  const rows = [];
  currentWorkshopQueue().forEach(({ pattern, revision, jobItem }) => {
    const href = `#/jobs/${jobItem.id}`;
    const label = `${labelForJob(jobItem)} ${pattern.pattern_number} ${revision.filename_revision}`;
    if (revision.pdf_file_id && !revision.nc_file_id) rows.push(dashboardItem("CNC", label, "PDF uploaded but NC file is missing", jobItem.target_install_date, href, "warning", "NC"));
    if (revision.nc_file_id && !revision.pdf_file_id) rows.push(dashboardItem("CNC", label, "NC file uploaded but PDF is missing", jobItem.target_install_date, href, "warning", "PDF"));
    if (revision.review_required) rows.push(dashboardItem("CNC", label, revision.review_reason || "Revision needs review", jobItem.target_install_date, href, "urgent", "Review"));
    if (revision.completed_run_quantity < revision.required_run_quantity && ["ready_for_cnc", "partially_cut"].includes(revision.production_status)) {
      rows.push(dashboardItem("CNC", label, `${revision.required_run_quantity - revision.completed_run_quantity} physical run(s) remaining`, jobItem.target_install_date, href, "normal", "Cut"));
    }
  });
  openRemakes().forEach((remake) => {
    const jobItem = jobById(remake.job_id);
    if (!jobItem) return;
    const label = `${labelForJob(jobItem)}: ${remake.part_number || remake.part_name || remake.description || "Remake"}`;
    if (["requested", "waiting_to_add_to_mozaik"].includes(remake.status)) rows.push(dashboardItem("Remake", label, "Not added to Mozaik yet", remake.required_by || jobItem.target_install_date, `#/remakeform/${remake.id}`, "warning", "Mozaik"));
    if (remake.status === "waiting_for_updated_files") rows.push(dashboardItem("Remake", label, "Waiting for updated PDF/NC files", remake.required_by || jobItem.target_install_date, `#/remakeform/${remake.id}`, "warning", "Files"));
    if (remake.status === "cut") rows.push(dashboardItem("Remake", label, "Cut remake needs edge banding / quality check", remake.required_by || jobItem.target_install_date, `#/remakeform/${remake.id}`, "warning", "QC"));
    if (remake.required_by && remake.required_by < localDateKey()) rows.push(dashboardItem("Remake", label, "Remake overdue", remake.required_by, `#/remakeform/${remake.id}`, "urgent", "Overdue"));
  });
  return rows.sort((a, b) => dashboardSeveritySort(a) - dashboardSeveritySort(b) || (a.sortDate || "9999").localeCompare(b.sortDate || "9999"));
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
  const suppliers = state.suppliers
    .filter((supplierItem) => supplierItem.active)
    .sort((a, b) => a.supplier_name.localeCompare(b.supplier_name));
  const toGet = activeItems().length;
  const rows = suppliers.map((supplierItem) => {
    const items = activeItems().filter((item) => item.supplier_id === supplierItem.id);
    return `
      <a class="list-link mobile-list-card store-card" href="#/suppliers/${supplierItem.id}">
        <span>
          <strong>${escapeHtml(supplierItem.supplier_name)}</strong><br>
          <span class="muted">${escapeHtml([supplierItem.supplier_type, supplierItem.town, items.length ? `${items.length} items` : "No items"].filter(Boolean).join(" - "))}</span>
        </span>
        <span class="mobile-card-end"><span class="count-pill">${items.length}</span><span aria-hidden="true">&rsaquo;</span></span>
      </a>
    `;
  }).join("");

  app.innerHTML = `
    <div class="stack mobile-page mobile-run-list-page">
      <section class="mobile-page-intro">
        <div class="mobile-title-row">
          <div><p class="mobile-eyebrow">RUN LIST</p><h2>Shopping lists</h2></div>
          <a class="primary-action" href="#/add">+ Add item</a>
        </div>
        <p class="muted">Keep each supplier list together so you can collect everything in one trip.</p>
        <div class="mobile-stat-grid">
          <div><strong>${toGet}</strong><span>Items to get</span></div>
          <div><strong>${suppliers.length}</strong><span>Suppliers</span></div>
        </div>
      </section>
      <div class="mobile-segmented" aria-label="Run list view">
        <a class="active" href="#/suppliers">By store</a>
        <a href="#/jobs">By job</a>
      </div>
      <section class="mobile-list-section">
        <div class="section-heading"><h2>Store lists</h2><a class="ghost-button" href="#/settings">Manage</a></div>
        <div class="list">${rows || empty("No active suppliers yet.")}</div>
      </section>
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
  const stageTabs = LEAD_PIPELINE_STAGES.map((stage) => {
    const count = activeLeads().filter((leadItem) => leadItem.status === stage).length;
    return `<a class="${statusFilter === stage ? "active" : ""}" href="#/leads?status=${encodeURIComponent(stage)}"><span>${escapeHtml(readable(stage))}</span><b>${count}</b></a>`;
  }).join("");
  const rows = leads.map((leadItem) => `
    <a class="list-link mobile-list-card lead-card" href="#/leads/${leadItem.id}">
      <span>
        <strong>${escapeHtml(labelForLead(leadItem))}</strong><br>
        <span class="muted">${escapeHtml([leadItem.lead_name, leadItem.location, leadItem.next_follow_up ? `Follow up ${formatDate(leadItem.next_follow_up)}` : ""].filter(Boolean).join(" - "))}</span>
      </span>
      <span class="mobile-card-end"><span class="status-pill ${leadItem.priority === "urgent" ? "urgent" : ""}">${escapeHtml(readable(leadItem.status))}</span><span aria-hidden="true">&rsaquo;</span></span>
    </a>
  `).join("");

  app.innerHTML = `
    <div class="stack mobile-page mobile-leads-page">
      <section class="mobile-page-intro">
        <div class="mobile-title-row"><div><p class="mobile-eyebrow">CLIENT PIPELINE</p><h2>Leads</h2></div><a class="primary-action" href="#/leadform">+ New lead</a></div>
        <p class="muted">Quick access to every enquiry, next action, and measure-up.</p>
      </section>
      ${showClosed ? '<a class="ghost-button full-width" href="#/leads">Show active leads</a>' : `<div class="mobile-stage-tabs">${stageTabs}</div>`}
      ${statusFilter ? '<a class="plain-button mobile-clear-filter" href="#/leads">Clear stage filter</a>' : ""}
      <section class="mobile-list-section">
        <div class="section-heading"><h2>${escapeHtml(statusFilter ? readable(statusFilter) : "Active leads")}</h2><span class="count-pill">${leads.length}</span></div>
        <div class="list">${rows || empty(statusFilter ? `No active leads in ${readable(statusFilter)}.` : showClosed ? "No closed leads yet." : "No active leads yet.")}</div>
      </section>
      ${showClosed ? "" : '<a class="ghost-button full-width" href="#/leads?show=closed">View closed leads</a>'}
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
  const stageTabs = JOB_PIPELINE_STAGES.map((stage) => {
    const count = openJobs().filter((jobItem) => jobItem.status === stage).length;
    return `<a class="${statusFilter === stage ? "active" : ""}" href="#/jobs?status=${encodeURIComponent(stage)}"><span>${escapeHtml(readable(stage))}</span><b>${count}</b></a>`;
  }).join("");
  const rows = jobs
    .sort((a, b) => jobStageSort(a.status) - jobStageSort(b.status) || labelForJob(a).localeCompare(labelForJob(b)))
    .map((jobItem) => {
      const count = activeItems().filter((item) => item.job_id === jobItem.id).length;
      const packing = latestChecklistForType(jobItem.id, "packing");
      const qc = latestChecklistForType(jobItem.id, "qc_completion");
      const checklistMeta = [packing ? `Packing ${checklistProgress(packing.id).percent}%` : "Packing not started", qc ? `QC ${checklistProgress(qc.id).percent}%` : "QC not started"].join(" - ");
      return `
        <a class="list-link mobile-list-card job-card" href="#/jobs/${jobItem.id}">
          <span>
            <strong>${escapeHtml(labelForJob(jobItem))}</strong><br>
            <span class="muted">${escapeHtml([jobItem.job_number, jobItem.location, checklistMeta].filter(Boolean).join(" - ") || "Job")}</span>
          </span>
          <span class="mobile-card-end"><span class="status-pill ${jobItem.priority === "urgent" ? "urgent" : ""}">${escapeHtml(readable(jobItem.status))}</span><span class="count-pill">${count}</span><span aria-hidden="true">&rsaquo;</span></span>
        </a>
      `;
    }).join("");

  app.innerHTML = `
    <div class="stack mobile-page mobile-jobs-page">
      <section class="mobile-page-intro">
        <div class="mobile-title-row"><div><p class="mobile-eyebrow">JOB TRACKER</p><h2>Jobs</h2></div><a class="primary-action" href="#/jobform">+ New job</a></div>
        <div class="mobile-stat-grid"><div><strong>${openJobs().length}</strong><span>Open jobs</span></div><div><strong>${activeItems().filter((item) => item.job_id).length}</strong><span>Run-list items</span></div></div>
      </section>
      ${showClosed ? '<a class="ghost-button full-width" href="#/jobs">Show open jobs</a>' : `<div class="mobile-stage-tabs">${stageTabs}</div>`}
      ${statusFilter ? '<a class="plain-button mobile-clear-filter" href="#/jobs">Clear stage filter</a>' : ""}
      <section class="mobile-list-section">
        <div class="section-heading"><h2>${escapeHtml(statusFilter ? readable(statusFilter) : "Open jobs")}</h2><span class="count-pill">${jobs.length}</span></div>
        <div class="list">${rows || empty(statusFilter ? `No open jobs in ${readable(statusFilter)}.` : showClosed ? "No completed or cancelled jobs yet." : "No open jobs yet.")}</div>
      </section>
      <div class="mobile-quick-actions"><a class="ghost-button" href="#/add">Add run-list item</a><a class="ghost-button" href="#/stages">View all stages</a></div>
      ${showClosed ? "" : '<a class="ghost-button full-width" href="#/jobs?show=closed">View completed / cancelled</a>'}
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
      ${renderJobWorkshopArea(id)}
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
  bindJobWorkshopArea(id);
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

function renderJobWorkshopArea(jobId) {
  const patterns = cutPatternsForJob(jobId);
  const remakes = remakesForJob(jobId).filter((item) => !["returned_to_job", "cancelled"].includes(item.status));
  return `
    <section class="panel workshop-panel">
      <div class="section-heading">
        <h2>Workshop / Mozaik</h2>
        <span class="count-pill">${patterns.length} patterns</span>
      </div>
      <div class="toolbar">
        <a class="primary-action" href="#/cutimport?job_id=${encodeURIComponent(jobId)}">Import Cut Files</a>
        <a class="primary-action" href="#/folderimport?job_id=${encodeURIComponent(jobId)}">Select Customer Folder</a>
        <a class="ghost-button" href="#/dymolabels?job_id=${encodeURIComponent(jobId)}">Print Dymo Labels</a>
        <button class="ghost-button" id="manualPatternButton" type="button">Manual Pattern</button>
        <a class="ghost-button" href="#/remakeform?job_id=${encodeURIComponent(jobId)}">Add Remake</a>
        <a class="ghost-button" href="#/workshop">Workshop Dashboard</a>
      </div>
      ${patterns.length ? patterns.map(renderCutPatternSummary).join("") : empty("No cut patterns imported for this job yet.")}
      <div class="section-heading">
        <h3>Open remakes</h3>
        <span class="count-pill">${remakes.length}</span>
      </div>
      <div class="list">${remakes.length ? remakes.map(renderRemakeListRow).join("") : empty("No open remakes for this job.")}</div>
    </section>
  `;
}

function renderCutPatternSummary(pattern) {
  const revisions = cutRevisionsForPattern(pattern.id);
  const current = revisions.find((item) => item.id === pattern.current_revision_id) || revisions.find((item) => item.is_current) || revisions[0];
  if (!current) return "";
  const pct = current.required_run_quantity ? Math.min(100, Math.round((current.completed_run_quantity / current.required_run_quantity) * 100)) : 0;
  const pdf = jobFileById(current.pdf_file_id);
  const nc = jobFileById(current.nc_file_id);
  const linkedRemakes = openRemakes().filter((item) => item.destination_cut_pattern_revision_id === current.id);
  return `
    <article class="workshop-card ${current.is_superseded ? "danger-state" : ""}">
      ${current.is_superseded ? '<p class="danger-text"><strong>Superseded — Do Not Cut</strong></p>' : ""}
      ${current.review_required ? `<p class="danger-text"><strong>Review required:</strong> ${escapeHtml(current.review_reason)}</p>` : ""}
      <div class="item-title-line">
        <h3>${escapeHtml(pattern.material_description || pattern.material_code)} — Pattern ${escapeHtml(pattern.pattern_number)} ${escapeHtml(current.filename_revision)}</h3>
        <span class="status-pill">${escapeHtml(readable(current.production_status))}</span>
      </div>
      <p class="muted">${escapeHtml([current.pdf_filename || "PDF missing", current.nc_filename || "NC missing", `${linkedRemakes.length} linked remakes`].join(" - "))}</p>
      <div class="run-progress">
        <strong>${current.completed_run_quantity} of ${current.required_run_quantity} cut</strong>
        <span>${Math.max(0, current.required_run_quantity - current.completed_run_quantity)} remaining</span>
        <div class="progress-bar"><span style="width:${pct}%"></span></div>
      </div>
      <div class="item-controls wrap-controls">
        ${pdf?.file_url ? `<a class="ghost-button" href="${escapeAttr(pdf.file_url)}" target="_blank" rel="noreferrer">View PDF</a>` : '<span class="status-pill warning">PDF missing</span>'}
        ${pdf ? renderPdfUsageNote(pdf) : ""}
        ${nc?.file_url ? `<a class="ghost-button" href="${escapeAttr(nc.file_url)}" target="_blank" rel="noreferrer">Open NC</a>` : '<span class="status-pill warning">NC missing</span>'}
        <a class="primary-action" href="#/cutting/${encodeURIComponent(current.id)}">Cutting Mode</a>
        ${pdf ? `<button class="danger-button delete-workshop-file" data-file-id="${escapeAttr(pdf.id)}" type="button">Remove PDF</button>` : ""}
        ${nc ? `<button class="danger-button delete-workshop-file" data-file-id="${escapeAttr(nc.id)}" type="button">Remove NC</button>` : ""}
        <button class="primary-action mark-one-run" data-revision-id="${escapeAttr(current.id)}" type="button">Mark One Run Cut</button>
        <button class="ghost-button mark-many-runs" data-revision-id="${escapeAttr(current.id)}" type="button">Mark Multiple</button>
        <a class="ghost-button" href="#/remakeform?job_id=${encodeURIComponent(pattern.job_id)}&revision_id=${encodeURIComponent(current.id)}">Add Remake</a>
      </div>
      ${renderPatternVersionHistory(pattern, revisions)}
    </article>
  `;
}

function renderPatternVersionHistory(pattern, revisions) {
  if (!revisions.length) return "";
  return `
    <details class="version-history" ${revisions.length > 1 ? "open" : ""}>
      <summary>PDF / NC versions (${revisions.length})</summary>
      <div class="version-list">
        ${revisions.map((revision) => {
          const pdf = jobFileById(revision.pdf_file_id);
          const nc = jobFileById(revision.nc_file_id);
          const labels = [
            revision.is_current ? "Current" : "",
            revision.is_superseded ? "Superseded — Do Not Cut" : "",
            revision.review_required ? "Review required" : "",
          ].filter(Boolean);
          return `
            <article class="version-row ${revision.is_superseded ? "danger-state" : ""}">
              <div>
                <strong>${escapeHtml(pattern.pattern_number)} ${escapeHtml(revision.filename_revision)} — internal v${escapeHtml(revision.internal_revision)}</strong>
                <p class="muted">${escapeHtml([readable(revision.production_status), `${revision.completed_run_quantity}/${revision.required_run_quantity} cut`, ...labels].filter(Boolean).join(" - "))}</p>
                <p class="muted">PDF: ${escapeHtml(revision.pdf_filename || "Missing")}<br>NC: ${escapeHtml(revision.nc_filename || "Missing")}</p>
                ${revision.review_reason ? `<p class="danger-text">${escapeHtml(revision.review_reason)}</p>` : ""}
              </div>
              <div class="item-controls wrap-controls">
                ${pdf?.file_url ? `<a class="ghost-button" href="${escapeAttr(pdf.file_url)}" target="_blank" rel="noreferrer">View this PDF</a>` : '<span class="status-pill warning">No PDF</span>'}
                ${pdf ? renderPdfUsageNote(pdf) : ""}
                ${nc?.file_url ? `<a class="ghost-button" href="${escapeAttr(nc.file_url)}" target="_blank" rel="noreferrer">Open this NC</a>` : '<span class="status-pill warning">No NC</span>'}
                ${pdf ? `<button class="danger-button delete-workshop-file" data-file-id="${escapeAttr(pdf.id)}" type="button">Remove PDF</button>` : ""}
                ${nc ? `<button class="danger-button delete-workshop-file" data-file-id="${escapeAttr(nc.id)}" type="button">Remove NC</button>` : ""}
              </div>
            </article>
          `;
        }).join("")}
      </div>
    </details>
  `;
}

function renderRemakeListRow(remake) {
  const jobItem = jobById(remake.job_id);
  const label = remake.part_number || remake.part_name || remake.description || "Remake";
  const dims = [remake.width, remake.length].filter(Boolean).join(" x ");
  return `
    <article class="list-link remake-row" data-remake-id="${escapeAttr(remake.id)}">
      <span>
        <strong>${escapeHtml(label)}</strong><br>
        <span class="muted">${escapeHtml([jobItem ? labelForJob(jobItem) : "", `Qty ${remake.quantity}`, remake.material_code, dims, remake.reason ? readable(remake.reason) : ""].filter(Boolean).join(" - "))}</span>
      </span>
      <span class="status-pill">${escapeHtml(readable(remake.status))}</span>
    </article>
  `;
}

function bindJobWorkshopArea(jobId) {
  document.getElementById("manualPatternButton")?.addEventListener("click", () => createManualPatternForJob(jobId));
  bindWorkshopButtons();
}

function renderWorkshopMobileBlocker() {
  return `
    <section class="panel workshop-mobile-only mobile-workshop-blocker">
      <h2>Workshop screen needs a bigger display</h2>
      <p class="muted">Use the workshop PC, CNC PC, laptop, or tablet for Workshop and Cutting Mode. The normal Run List, Orders, Leads, Jobs, and supplier screens still work on your phone.</p>
      <div class="form-actions">
        <a class="primary-action" href="#/">Open Run List</a>
        <a class="ghost-button" href="#/orders">Open Orders</a>
      </div>
    </section>
  `;
}
function renderWorkshopDashboard() {
  setTitle("Workshop / CNC");
  const params = getRoute().params;
  const queue = currentWorkshopQueue();
  const selected = workshopSelectedQueueItem(params.revision_id, queue);
  const allCurrent = workshopCurrentPatternItems();
  const ready = allCurrent.filter((item) => workshopQueueBucket(item) === "ready");
  const cutting = allCurrent.filter((item) => workshopQueueBucket(item) === "cutting");
  const problems = allCurrent.filter((item) => workshopQueueBucket(item) === "problem");
  const selectedJobPatterns = selected ? workshopPatternItemsForJob(selected.jobItem.id) : [];
  const selectedJobRemakes = selected ? remakesForJob(selected.jobItem.id).filter((item) => !["returned_to_job", "cancelled"].includes(item.status)) : [];
  const activity = selected ? state.activity_history.filter((item) => item.job_id === selected.jobItem.id).slice(0, 6) : [];

  app.innerHTML = `
    ${renderWorkshopMobileBlocker()}
    <div class="workshop-refresh workshop-desktop-only">
      <section class="workshop-refresh-topbar">
        <div class="workshop-brand-lockup">
          <div class="logo-mark">CN</div>
          <div>
            <strong>Cabinet Ninja</strong>
            <span>Workshop control panel</span>
          </div>
        </div>
        <div>
          <h2>Workshop / CNC</h2>
          <p class="muted">Cut files, labels, remakes, and CNC progress</p>
        </div>
        <div class="workshop-clock">
          <span>${escapeHtml(fullDateLabel())}</span>
          <strong>${escapeHtml(new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }))}</strong>
        </div>
        <div class="workshop-top-actions">
          <a class="primary-action" href="#/folderimport${selected ? `?job_id=${encodeURIComponent(selected.jobItem.id)}` : ""}">Select Customer Folder</a>
          <a class="primary-action" href="#/dymolabels${selected ? `?job_id=${encodeURIComponent(selected.jobItem.id)}` : ""}">Print Dymo Labels</a>
          <a class="primary-action" href="#/remakeform${selected ? `?job_id=${encodeURIComponent(selected.jobItem.id)}` : ""}">Add Remake</a>
        </div>
      </section>

      <section class="workshop-refresh-layout">
        <aside class="workshop-queue-sidebar">
          ${renderWorkshopQueueSection("Jobs ready for CNC", ready, "ready", selected?.revision.id)}
          ${renderWorkshopQueueSection("Jobs cutting", cutting, "cutting", selected?.revision.id)}
          ${renderWorkshopQueueSection("Jobs with problems", problems, "problem", selected?.revision.id)}
        </aside>

        <div class="workshop-main-board">
          ${selected ? renderWorkshopCurrentJobHero(selected) : renderWorkshopEmptyHero()}
          ${selected ? `
            <section class="workshop-board-grid">
              <div class="workshop-board-main stack">
                ${renderWorkshopFileHealthCard(selected, selectedJobPatterns)}
                ${renderWorkshopCutPatternsTable(selected, selectedJobPatterns)}
              </div>
              <aside class="workshop-board-side stack">
                ${renderWorkshopRemakesCard(selected, selectedJobRemakes)}
                ${renderWorkshopDymoCard(selected)}
                ${renderWorkshopActivityCard(activity)}
              </aside>
            </section>
          ` : `
            <section class="panel">
              <h2>No CNC patterns yet</h2>
              <p class="muted">Select a customer folder or import cut files to start building the workshop queue.</p>
            </section>
          `}
        </div>
      </section>

      <p class="workshop-tip">Tip: keep your Mozaik cut-sheet PDF named <strong>sheets.pdf</strong> for best auto-detection. Rescan the customer folder any time to pick up updates or remakes.</p>
    </div>
  `;
  bindWorkshopButtons();
}

function workshopCurrentPatternItems() {
  return state.cut_patterns
    .map((pattern) => {
      const revision = currentCutRevisionForPattern(pattern.id);
      const jobItem = jobById(pattern.job_id);
      return revision && jobItem ? { pattern, revision, jobItem } : null;
    })
    .filter(Boolean)
    .filter((item) => !["cancelled", "superseded"].includes(item.revision.production_status))
    .sort((a, b) => (a.jobItem.target_install_date || "9999").localeCompare(b.jobItem.target_install_date || "9999") || labelForJob(a.jobItem).localeCompare(labelForJob(b.jobItem)) || a.pattern.pattern_number.localeCompare(b.pattern.pattern_number));
}

function workshopSelectedQueueItem(revisionId, queue) {
  const all = workshopCurrentPatternItems();
  if (revisionId) {
    const selected = all.find((item) => item.revision.id === revisionId);
    if (selected) return selected;
  }
  return queue[0] || all.find((item) => workshopQueueBucket(item) === "problem") || all[0] || null;
}

function workshopPatternItemsForJob(jobId) {
  return cutPatternsForJob(jobId)
    .map((pattern) => ({ pattern, revision: currentCutRevisionForPattern(pattern.id), jobItem: jobById(jobId) }))
    .filter((item) => item.revision);
}

function workshopQueueBucket({ revision }) {
  if (revision.review_required || revision.production_status === "problem" || !(revision.pdf_file_id && revision.nc_file_id)) return "problem";
  if (["cutting", "partially_cut"].includes(revision.production_status)) return "cutting";
  return "ready";
}

function workshopStatusPill(revision) {
  if (revision.review_required) return { label: "Review required", tone: "urgent" };
  if (!revision.pdf_file_id) return { label: "PDF missing", tone: "urgent" };
  if (!revision.nc_file_id) return { label: "NC missing", tone: "warning" };
  if (revision.production_status === "cut_complete") return { label: "Cut complete", tone: "good" };
  return { label: readable(revision.production_status), tone: revision.production_status === "ready_for_cnc" ? "good" : "" };
}

function renderWorkshopQueueSection(titleText, items, bucket, selectedRevisionId) {
  return `
    <section class="panel workshop-queue-section ${escapeAttr(bucket)}">
      <div class="section-heading">
        <h2>${escapeHtml(titleText)}</h2>
        <span class="count-pill">${items.length}</span>
      </div>
      <div class="workshop-queue-list">
        ${items.slice(0, 8).map((item) => renderWorkshopQueueMiniCard(item, selectedRevisionId)).join("") || empty("Nothing here right now.")}
      </div>
    </section>
  `;
}

function renderWorkshopQueueMiniCard({ pattern, revision, jobItem }, selectedRevisionId) {
  const status = workshopStatusPill(revision);
  const active = revision.id === selectedRevisionId;
  return `
    <a class="workshop-mini-job ${active ? "active" : ""}" href="#/workshop?revision_id=${encodeURIComponent(revision.id)}">
      <span class="mini-job-icon">${status.tone === "urgent" ? "!" : "&check;"}</span>
      <span class="mini-job-body">
        <strong>${escapeHtml(labelForJob(jobItem))}</strong>
        <span>${escapeHtml([pattern.material_description || pattern.material_code, pattern.pattern_number, jobItem.location].filter(Boolean).join(" - "))}</span>
      </span>
      <span class="status-pill ${escapeAttr(status.tone)}">${escapeHtml(status.label)}</span>
    </a>
  `;
}

function renderWorkshopEmptyHero() {
  return `
    <section class="panel workshop-current-hero">
      <div>
        <p class="muted">Current Job</p>
        <h2>No current CNC job</h2>
        <p class="muted">Import cut files or select a customer folder to populate this dashboard.</p>
      </div>
      <div class="workshop-hero-actions">
        <a class="primary-action" href="#/folderimport">Select Customer Folder</a>
        <a class="ghost-button" href="#/cutimport">Import Cut Files</a>
      </div>
    </section>
  `;
}

function renderWorkshopCurrentJobHero({ pattern, revision, jobItem }) {
  const pdf = jobFileById(revision.pdf_file_id);
  const status = workshopStatusPill(revision);
  return `
    <section class="panel workshop-current-hero ${status.tone === "urgent" ? "danger-state" : ""}">
      <div class="workshop-current-title">
        <p class="muted">Current Job</p>
        <h2>${escapeHtml(labelForJob(jobItem))}</h2>
        <span class="status-pill ${escapeAttr(status.tone)}">${escapeHtml(status.label)}</span>
      </div>
      <div class="workshop-hero-meta">
        ${renderWorkshopMeta("Client", jobItem.client_name || "Not set")}
        ${renderWorkshopMeta("Location", jobItem.location || "Not set")}
        ${renderWorkshopMeta("Target install", jobItem.target_install_date ? formatDate(jobItem.target_install_date) : "Not set")}
        ${renderWorkshopMeta("Pattern", `${pattern.material_description || pattern.material_code} ${pattern.pattern_number}`)}
      </div>
      <div class="workshop-hero-actions">
        <a class="primary-action" href="#/folderimport?job_id=${encodeURIComponent(jobItem.id)}">Select Customer Folder</a>
        ${pdf?.file_url ? `<a class="ghost-button" href="${escapeAttr(pdf.file_url)}" target="_blank" rel="noreferrer">Open Cut-Sheet PDF</a>` : '<span class="status-pill warning">PDF missing</span>'}
        <a class="ghost-button" href="#/dymolabels?job_id=${encodeURIComponent(jobItem.id)}">Print Dymo Labels</a>
        <a class="ghost-button" href="#/remakeform?job_id=${encodeURIComponent(jobItem.id)}&revision_id=${encodeURIComponent(revision.id)}">Add Remake</a>
        <a class="ghost-button" href="#/cutting/${encodeURIComponent(revision.id)}">Cutting Mode</a>
      </div>
    </section>
  `;
}

function renderWorkshopMeta(label, value) {
  return `<div class="workshop-meta-item"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`;
}

function renderWorkshopFileHealthCard(selected, patternItems) {
  const pdf = jobFileById(selected.revision.pdf_file_id);
  const ncCount = patternItems.filter((item) => item.revision.nc_file_id).length;
  const pdfLinked = patternItems.filter((item) => item.revision.pdf_file_id).length;
  const reviewCount = patternItems.filter((item) => item.revision.review_required).length;
  const missingCount = patternItems.filter((item) => !(item.revision.pdf_file_id && item.revision.nc_file_id)).length;
  return `
    <section class="panel workshop-file-health">
      <div class="section-heading">
        <h2>File Health / Import</h2>
        <span class="status-pill ${missingCount || reviewCount ? "warning" : "good"}">${missingCount || reviewCount ? "Check files" : "Good"}</span>
      </div>
      <div class="file-health-grid">
        <article class="file-health-tile">
          <span class="file-health-icon pdf">PDF</span>
          <strong>Cut-sheet PDF</strong>
          <span>${escapeHtml(pdf?.original_filename || "Missing")}</span>
          <em>${pdfLinked} of ${patternItems.length} pattern(s) linked</em>
        </article>
        <article class="file-health-tile">
          <span class="file-health-icon nc">CNC</span>
          <strong>NC Files</strong>
          <span>${ncCount} NC file(s)</span>
          <em>${ncCount === patternItems.length ? "All patterns have NC files" : `${patternItems.length - ncCount} missing`}</em>
        </article>
        <article class="file-health-summary">
          ${metricRow("PDF status", pdfLinked ? "Found" : "Missing")}
          ${metricRow("NC files status", ncCount === patternItems.length ? "Good" : "Missing")}
          ${metricRow("Patterns linked", `${Math.min(pdfLinked, ncCount)} of ${patternItems.length}`)}
          ${metricRow("Review required", reviewCount ? String(reviewCount) : "No")}
        </article>
      </div>
      <div class="item-controls wrap-controls">
        <a class="primary-action" href="#/folderimport?job_id=${encodeURIComponent(selected.jobItem.id)}">Rescan Folder</a>
        ${pdf?.file_url ? `<a class="ghost-button" href="${escapeAttr(pdf.file_url)}" target="_blank" rel="noreferrer">Open PDF</a>` : ""}
      </div>
    </section>
  `;
}

function renderWorkshopCutPatternsTable(selected, patternItems) {
  return `
    <section class="panel workshop-pattern-panel">
      <div class="section-heading">
        <h2>Cut Patterns</h2>
        <span class="count-pill">${patternItems.length}</span>
      </div>
      <div class="workshop-pattern-table">
        <div class="workshop-pattern-head">
          <span>Material</span><span>Pattern</span><span>Rev</span><span>PDF</span><span>NC</span><span>Runs</span><span>Remaining</span><span>Actions</span>
        </div>
        ${patternItems.map((item) => renderWorkshopPatternRow(item, selected.revision.id)).join("") || empty("No cut patterns for this job.")}
      </div>
      <div class="workshop-table-legend"><span>&check; Good</span><span>! Warning</span><span>! Problem</span></div>
    </section>
  `;
}

function renderWorkshopPatternRow({ pattern, revision }, selectedRevisionId) {
  const pdf = jobFileById(revision.pdf_file_id);
  const nc = jobFileById(revision.nc_file_id);
  const remaining = Math.max(0, Number(revision.required_run_quantity || 0) - Number(revision.completed_run_quantity || 0));
  const problem = revision.review_required || !(pdf && nc);
  return `
    <article class="workshop-pattern-row ${problem ? "problem" : ""} ${revision.id === selectedRevisionId ? "active" : ""}">
      <span>${escapeHtml(pattern.material_description || pattern.material_code || "Material")}</span>
      <span>${escapeHtml(pattern.pattern_number)}</span>
      <span>${escapeHtml(revision.filename_revision)}</span>
      <span>${pdf ? "&check;" : "!"}</span>
      <span>${nc ? "&check;" : "!"}</span>
      <span>${escapeHtml(`${revision.completed_run_quantity}/${revision.required_run_quantity}`)}</span>
      <span>${remaining ? `<strong>${remaining}</strong>` : "Complete"}</span>
      <span class="item-controls wrap-controls">
        <a class="ghost-button" href="#/cutting/${encodeURIComponent(revision.id)}">Cut</a>
        <button class="ghost-button mark-one-run" data-revision-id="${escapeAttr(revision.id)}" type="button" ${remaining ? "" : "disabled"}>+1</button>
      </span>
    </article>
  `;
}

function renderWorkshopRemakesCard(selected, remakes) {
  return `
    <section class="panel workshop-side-card">
      <div class="section-heading">
        <h2>Remakes</h2>
        <span class="count-pill">${remakes.length}</span>
      </div>
      <div class="list">${remakes.length ? remakes.slice(0, 5).map(renderRemakeQueueRow).join("") : empty("No open remakes for this job.")}</div>
      <a class="plain-button" href="#/remakeform?job_id=${encodeURIComponent(selected.jobItem.id)}">Add Remake +</a>
    </section>
  `;
}

function renderWorkshopDymoCard(selected) {
  return `
    <section class="panel workshop-side-card dymo-mini-card">
      <div class="section-heading">
        <h2>Dymo Labels</h2>
        <span class="count-pill">11352</span>
      </div>
      <div class="dymo-mini-preview">
        <strong>C5 UEL</strong>
        <span>720 x 550</span>
        <em>&larr; &uarr; &rarr;</em>
      </div>
      <p class="muted">Print part labels with dimensions and edge-banding arrows.</p>
      <a class="primary-action" href="#/dymolabels?job_id=${encodeURIComponent(selected.jobItem.id)}">Print Labels</a>
    </section>
  `;
}

function renderWorkshopActivityCard(activity) {
  return `
    <section class="panel workshop-side-card">
      <div class="section-heading">
        <h2>Activity</h2>
        <span class="count-pill">${activity.length}</span>
      </div>
      <div class="list">
        ${activity.length ? activity.map((item) => `
          <div class="list-link compact-link">
            <span><strong>${escapeHtml(item.action)}</strong><br><span class="muted">${escapeHtml(formatDateTime(item.happened_at))}</span></span>
          </div>
        `).join("") : empty("No recent workshop activity for this job.")}
      </div>
    </section>
  `;
}
function renderWorkshopStat(label, value) {
  return `<section class="panel dashboard-card compact-stat"><strong>${escapeHtml(value)}</strong><span>${escapeHtml(label)}</span></section>`;
}

function currentWorkshopQueue() {
  return state.cut_patterns
    .map((pattern) => {
      const revision = currentCutRevisionForPattern(pattern.id);
      const jobItem = jobById(pattern.job_id);
      return revision && jobItem ? { pattern, revision, jobItem } : null;
    })
    .filter(Boolean)
    .filter((item) => !["cut_complete", "cancelled", "superseded"].includes(item.revision.production_status))
    .sort((a, b) => (a.jobItem.target_install_date || "9999").localeCompare(b.jobItem.target_install_date || "9999") || a.pattern.pattern_number.localeCompare(b.pattern.pattern_number));
}

function renderWorkshopQueueCard({ pattern, revision, jobItem }) {
  const pct = revision.required_run_quantity ? Math.min(100, Math.round((revision.completed_run_quantity / revision.required_run_quantity) * 100)) : 0;
  const pdf = jobFileById(revision.pdf_file_id);
  const nc = jobFileById(revision.nc_file_id);
  const linkedRemakes = openRemakes().filter((item) => item.destination_cut_pattern_revision_id === revision.id);
  return `
    <article class="panel workshop-card ${revision.review_required ? "danger-state" : ""}">
      ${revision.review_required ? `<p class="danger-text"><strong>Review required:</strong> ${escapeHtml(revision.review_reason)}</p>` : ""}
      <div class="item-title-line">
        <h3>${escapeHtml(labelForJob(jobItem))}</h3>
        <span class="status-pill">${escapeHtml(readable(revision.production_status))}</span>
      </div>
      <p class="muted">${escapeHtml(pattern.material_description || pattern.material_code)} — Pattern ${escapeHtml(pattern.pattern_number)} — Revision ${escapeHtml(revision.filename_revision)}</p>
      <div class="run-progress">
        <strong>${revision.completed_run_quantity} of ${revision.required_run_quantity} cut</strong>
        <span>${Math.max(0, revision.required_run_quantity - revision.completed_run_quantity)} remaining</span>
        <div class="progress-bar"><span style="width:${pct}%"></span></div>
      </div>
      <p class="muted">${escapeHtml([jobItem.target_install_date ? `Install ${formatDate(jobItem.target_install_date)}` : "", linkedRemakes.length ? `${linkedRemakes.length} linked remakes` : "No linked remakes", jobItem.next_action].filter(Boolean).join(" - "))}</p>
      <div class="item-controls wrap-controls">
        ${pdf?.file_url ? `<a class="ghost-button" href="${escapeAttr(pdf.file_url)}" target="_blank" rel="noreferrer">View PDF</a>` : '<span class="status-pill warning">PDF missing</span>'}
        ${pdf ? renderPdfUsageNote(pdf) : ""}
        ${nc?.file_url ? `<a class="ghost-button" href="${escapeAttr(nc.file_url)}" target="_blank" rel="noreferrer">Open NC</a>` : '<span class="status-pill warning">NC missing</span>'}
        <a class="primary-action" href="#/cutting/${encodeURIComponent(revision.id)}">Cutting Mode</a>
        ${pdf ? `<button class="danger-button delete-workshop-file" data-file-id="${escapeAttr(pdf.id)}" type="button">Remove PDF</button>` : ""}
        ${nc ? `<button class="danger-button delete-workshop-file" data-file-id="${escapeAttr(nc.id)}" type="button">Remove NC</button>` : ""}
        <button class="primary-action mark-one-run" data-revision-id="${escapeAttr(revision.id)}" type="button">Mark One Run Cut</button>
        <button class="ghost-button mark-many-runs" data-revision-id="${escapeAttr(revision.id)}" type="button">Mark Multiple</button>
        <a class="ghost-button" href="#/jobs/${encodeURIComponent(jobItem.id)}">Open Job</a>
      </div>
    </article>
  `;
}

function renderRemakeQueueRow(remake) {
  const jobItem = jobById(remake.job_id);
  return `
    <div class="list-link remake-row" data-remake-id="${escapeAttr(remake.id)}">
      <span>
        <strong>${escapeHtml(remake.part_number || remake.part_name || remake.description || "Remake")}</strong><br>
        <span class="muted">${escapeHtml([jobItem ? labelForJob(jobItem) : "", `Qty ${remake.quantity}`, remake.material_code, remake.required_by ? `Required ${formatDate(remake.required_by)}` : "", readable(remake.reason)].filter(Boolean).join(" - "))}</span>
      </span>
      <span class="item-controls wrap-controls">
        <select class="remake-status-select" data-remake-id="${escapeAttr(remake.id)}">${REMAKE_STATUS_OPTIONS.map(([value, label]) => `<option value="${value}" ${remake.status === value ? "selected" : ""}>${escapeHtml(label)}</option>`).join("")}</select>
        <a class="ghost-button" href="#/remakeform/${encodeURIComponent(remake.id)}">Edit</a>
      </span>
    </div>
  `;
}

function bindWorkshopButtons() {
  document.querySelectorAll(".mark-one-run").forEach((button) => {
    if (button.dataset.bound) return;
    button.dataset.bound = "true";
    button.addEventListener("click", () => markRunsCut(button.dataset.revisionId, 1));
  });
  document.querySelectorAll(".mark-many-runs").forEach((button) => {
    if (button.dataset.bound) return;
    button.dataset.bound = "true";
    button.addEventListener("click", () => {
      const quantity = Number(window.prompt("How many physical runs were cut?", "1"));
      if (!Number.isInteger(quantity) || quantity < 1) return toast("Enter a whole number of 1 or more.");
      markRunsCut(button.dataset.revisionId, quantity);
    });
  });
  document.querySelectorAll(".delete-workshop-file").forEach((button) => {
    if (button.dataset.bound) return;
    button.dataset.bound = "true";
    button.addEventListener("click", () => deleteWorkshopFile(button.dataset.fileId));
  });
  document.querySelectorAll(".remake-status-select").forEach((select) => {
    if (select.dataset.bound) return;
    select.dataset.bound = "true";
    select.addEventListener("change", () => updateRemakeStatus(select.dataset.remakeId, select.value));
  });
}

function renderCuttingModeScreen(revisionId) {
  const revision = cutRevisionById(revisionId);
  if (!revision) {
    renderNotFound("Cutting revision not found.");
    return;
  }
  const pattern = cutPatternById(revision.cut_pattern_id);
  const jobItem = jobById(revision.job_id);
  if (!pattern || !jobItem) {
    renderNotFound("Cutting job or pattern not found.");
    return;
  }
  setTitle("Cutting Mode");
  const pdf = jobFileById(revision.pdf_file_id);
  const nc = jobFileById(revision.nc_file_id);
  const pct = revision.required_run_quantity ? Math.min(100, Math.round((revision.completed_run_quantity / revision.required_run_quantity) * 100)) : 0;
  const remaining = Math.max(0, Number(revision.required_run_quantity || 0) - Number(revision.completed_run_quantity || 0));
  const blockers = [
    revision.is_superseded ? "This revision is superseded - Do Not Cut" : "",
    revision.review_required ? revision.review_reason || "Review required before cutting" : "",
    !pdf ? "Cut-sheet PDF missing" : "",
    !nc ? "NC file missing" : "",
  ].filter(Boolean);
  const jobRemakes = remakesForJob(jobItem.id).filter((item) => !["returned_to_job", "cancelled"].includes(item.status));
  const otherPatterns = cutPatternsForJob(jobItem.id)
    .map((candidate) => ({ pattern: candidate, revision: currentCutRevisionForPattern(candidate.id) }));

  app.innerHTML = `
    ${renderWorkshopMobileBlocker()}
    <div class="cutting-mode workshop-desktop-only">
      <section class="panel cutting-hero ${blockers.length ? "danger-state" : ""}">
        <div>
          <p class="muted">Cutting Mode</p>
          <h2>${escapeHtml(labelForJob(jobItem))}</h2>
          <p class="muted">${escapeHtml([jobItem.location, jobItem.target_install_date ? `Install ${formatDate(jobItem.target_install_date)}` : "", pattern.material_description || pattern.material_code].filter(Boolean).join(" - "))}</p>
        </div>
        <div class="cutting-hero-status">
          <span class="status-pill ${blockers.length ? "urgent" : ""}">${escapeHtml(blockers.length ? "Needs attention" : readable(revision.production_status))}</span>
          <strong>${escapeHtml(pattern.pattern_number)} ${escapeHtml(revision.filename_revision)}</strong>
        </div>
      </section>

      ${blockers.length ? `<section class="warning-panel cutting-alert"><strong>Check before cutting:</strong><ul>${blockers.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></section>` : ""}

      <section class="cutting-layout">
        <div class="cutting-main stack">
          <section class="panel cutting-action-panel">
            <div class="section-heading">
              <h2>Files and labels</h2>
              <span class="count-pill">Only what you need</span>
            </div>
            <div class="cutting-big-actions">
              ${pdf?.file_url ? `<a class="primary-action cutting-big-button" href="${escapeAttr(pdf.file_url)}" target="_blank" rel="noreferrer">Open Cut-Sheet PDF<span>${escapeHtml(pdf.original_filename)}</span></a>` : `<span class="cutting-big-button disabled-action">PDF Missing<span>Rescan customer folder</span></span>`}
              ${nc?.file_url ? `<a class="primary-action cutting-big-button" href="${escapeAttr(nc.file_url)}" target="_blank" rel="noreferrer">Open NC File<span>${escapeHtml(nc.original_filename)}</span></a>` : `<span class="cutting-big-button disabled-action">NC Missing<span>Rescan customer folder</span></span>`}
              <a class="ghost-button cutting-big-button" href="#/dymolabels?job_id=${encodeURIComponent(jobItem.id)}">Print Dymo Labels<span>Part labels + edge arrows</span></a>
              <a class="ghost-button cutting-big-button" href="#/folderimport?job_id=${encodeURIComponent(jobItem.id)}">Rescan Customer Folder<span>Pick up remakes / changed files</span></a>
            </div>
          </section>

          <section class="panel cutting-progress-panel">
            <div class="section-heading">
              <h2>Cut progress</h2>
              <span class="count-pill">${escapeHtml(`${revision.completed_run_quantity}/${revision.required_run_quantity}`)}</span>
            </div>
            <div class="cutting-progress-number">${escapeHtml(String(remaining))}<span>run(s) remaining</span></div>
            <div class="progress-bar large-progress"><span style="width:${pct}%"></span></div>
            <div class="cutting-controls">
              <button class="primary-action start-cutting-mode" data-revision-id="${escapeAttr(revision.id)}" type="button" ${blockers.length || !remaining ? "disabled" : ""}>Set Cutting</button>
              <button class="primary-action mark-one-run" data-revision-id="${escapeAttr(revision.id)}" type="button" ${remaining ? "" : "disabled"}>Mark One Run Cut</button>
              <button class="ghost-button mark-many-runs" data-revision-id="${escapeAttr(revision.id)}" type="button" ${remaining ? "" : "disabled"}>Mark Multiple</button>
              <a class="ghost-button" href="#/remakeform?job_id=${encodeURIComponent(jobItem.id)}&revision_id=${encodeURIComponent(revision.id)}">Add Remake</a>
            </div>
          </section>

          <section class="panel">
            <div class="section-heading">
              <h2>Other patterns for this job</h2>
              <span class="count-pill">${otherPatterns.length}</span>
            </div>
            <div class="cutting-pattern-list">
              ${otherPatterns.map((item) => renderCuttingPatternJump(item.pattern, item.revision, revision.id)).join("") || empty("No other patterns.")}
            </div>
          </section>
        </div>

        <aside class="cutting-side stack">
          <section class="panel">
            <h2>Current pattern</h2>
            <div class="list">
              ${metricRow("Material", pattern.material_description || pattern.material_code || "Not set")}
              ${metricRow("Pattern", pattern.pattern_number || "Not set")}
              ${metricRow("Revision", revision.filename_revision || "Not set")}
              ${metricRow("PDF", pdf ? "Ready" : "Missing")}
              ${metricRow("NC", nc ? "Ready" : "Missing")}
              ${metricRow("Review", revision.review_required ? "Required" : "No")}
            </div>
          </section>

          <section class="panel">
            <div class="section-heading">
              <h2>Open remakes</h2>
              <span class="count-pill">${jobRemakes.length}</span>
            </div>
            <div class="list">${jobRemakes.length ? jobRemakes.slice(0, 6).map(renderRemakeQueueRow).join("") : empty("No open remakes for this job.")}</div>
          </section>

          <section class="panel">
            <h2>Back</h2>
            <div class="cutting-controls">
              <a class="ghost-button" href="#/jobs/${encodeURIComponent(jobItem.id)}">Open Job</a>
              <a class="ghost-button" href="#/workshop">Workshop Dashboard</a>
            </div>
          </section>
        </aside>
      </section>
    </div>
  `;
  bindWorkshopButtons();
  bindCuttingModeButtons();
}

function renderCuttingPatternJump(pattern, revision, currentRevisionId) {
  if (!revision) return "";
  const active = revision.id === currentRevisionId;
  const remaining = Math.max(0, Number(revision.required_run_quantity || 0) - Number(revision.completed_run_quantity || 0));
  return `
    <a class="list-link cutting-pattern-jump ${active ? "active" : ""}" href="#/cutting/${encodeURIComponent(revision.id)}">
      <span>
        <strong>${escapeHtml(pattern.pattern_number)} - ${escapeHtml(pattern.material_description || pattern.material_code)}</strong><br>
        <span class="muted">${escapeHtml([revision.filename_revision, readable(revision.production_status), `${remaining} remaining`].filter(Boolean).join(" - "))}</span>
      </span>
      <span class="status-pill">${active ? "Current" : escapeHtml(readable(revision.production_status))}</span>
    </a>
  `;
}

function bindCuttingModeButtons() {
  document.querySelectorAll(".start-cutting-mode").forEach((button) => {
    if (button.dataset.bound) return;
    button.dataset.bound = "true";
    button.addEventListener("click", () => setRevisionCutting(button.dataset.revisionId));
  });
}

function setRevisionCutting(revisionId) {
  const revision = cutRevisionById(revisionId);
  if (!revision) return;
  if (revision.is_superseded || !revision.is_current) return toast("Superseded - Do Not Cut. Use the current revision.");
  if (!(revision.pdf_file_id && revision.nc_file_id)) return toast("PDF and NC file are required before cutting.");
  if (Number(revision.completed_run_quantity || 0) >= Number(revision.required_run_quantity || 0)) return toast("This pattern is already cut complete.");
  revision.production_status = "cutting";
  revision.updated_at = nowIso();
  const pattern = cutPatternById(revision.cut_pattern_id);
  if (pattern) {
    pattern.status = "cutting";
    pattern.updated_at = nowIso();
  }
  logActivity(revision.job_id, "cut_pattern_revision", revision.id, "Cutting started", "", "cutting");
  saveState();
  render();
}
function renderCutImportForm(params = {}) {
  const selectedJobId = params.job_id || "";
  setTitle("Import Cut Files");
  app.innerHTML = `
    <form class="panel form-grid" id="cutImportForm">
      ${selectField("Job", "job_id", selectedJobId, state.jobs.filter((jobItem) => jobItem.active).map((jobItem) => [jobItem.id, labelForJob(jobItem)]), true)}
      <div class="field full">
        <label>Mozaik PDF / NC files
          <input name="files" type="file" multiple accept=".pdf,.nc,.cnc,.tap,.gcode,application/pdf" required />
        </label>
      </div>
      ${field("Required physical runs", "required_run_quantity", "number", params.required_run_quantity || "1", "", true)}
      ${field("Material code override", "material_code", "text", params.material_code || "")}
      ${field("Material description", "material_description", "text", params.material_description || "")}
      ${field("Pattern override", "pattern_number", "text", params.pattern_number || "")}
      ${field("Revision override", "filename_revision", "text", params.filename_revision || "")}
      ${textareaField("Import notes", "revision_notes", "", "full")}
      <section class="warning-panel full">
        <strong>PDF versions:</strong> To add a revised PDF, use this same form. Upload the new PDF/NC pair and enter the new revision, for example <strong>R02</strong>. If Mozaik reused the same filename but the file changed, Run List keeps the old PDF and creates an internal version for review.<br><br>
        <strong>Safety:</strong> Run List stores CNC files and tracks cutting progress. It does not execute, edit, or interpret G-code.
      </section>
      <div class="form-actions full">
        <button class="primary-action" type="submit">Import files</button>
        <a class="ghost-button" href="${selectedJobId ? `#/jobs/${encodeURIComponent(selectedJobId)}` : "#/workshop"}">Cancel</a>
      </div>
    </form>
  `;
  document.getElementById("cutImportForm").addEventListener("submit", handleCutImportSubmit);
}

async function handleCutImportSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const submit = form.querySelector("button[type='submit']");
  submit.disabled = true;
  submit.textContent = "Importing...";
  try {
    const formData = new FormData(form);
    const jobId = formData.get("job_id");
    const jobItem = jobById(jobId);
    if (!jobItem) throw new Error("Choose a job.");
    const files = [...form.querySelector("input[type='file']").files];
    if (!files.length) throw new Error("Choose at least one file.");
    await importCutFilesForJob(jobItem, files, Object.fromEntries(formData.entries()));
    saveState();
    toast("Cut files imported.");
    navigate(`/jobs/${jobId}`);
  } catch (error) {
    toast(error.message);
    submit.disabled = false;
    submit.textContent = "Import files";
  }
}

async function importCutFilesForJob(jobItem, files, manual = {}) {
  const groups = {};
  for (const file of files) {
    const parsed = parseMozaikFilename(file.name);
    if (!parsed.file_kind) throw new Error(`Unsupported file type: ${file.name}`);
    if (manual.material_code) parsed.material_code = String(manual.material_code).trim().toUpperCase();
    if (manual.material_description) parsed.material_description = String(manual.material_description).trim();
    if (manual.pattern_number) parsed.pattern_number = normalizePatternNumber(manual.pattern_number);
    if (manual.filename_revision) parsed.filename_revision = normalizeRevisionNumber(manual.filename_revision);
    parsed.material_code ||= "UNKNOWN";
    parsed.material_description ||= materialDescriptionFromCode(parsed.material_code);
    parsed.thickness ||= thicknessFromMaterialCode(parsed.material_code);
    parsed.pattern_number = normalizePatternNumber(parsed.pattern_number || "S01");
    parsed.filename_revision = normalizeRevisionNumber(parsed.filename_revision || "R01");
    const record = await storeWorkshopFile(jobItem, file, parsed);
    const key = `${parsed.material_code}|${parsed.pattern_number}|${parsed.filename_revision}`;
    groups[key] ||= { parsed, pdf: null, nc: null };
    groups[key][parsed.file_kind] = record;
  }
  Object.values(groups).forEach((group) => importCutFileGroup(jobItem, group, manual));
}

function renderMaterialFolderImportForm(params = {}) {
  const selectedJobId = params.job_id || "";
  setTitle("Select Customer Folder");
  app.innerHTML = `
    <form class="panel form-grid" id="folderImportForm">
      ${selectField("Job", "job_id", selectedJobId, state.jobs.filter((jobItem) => jobItem.active).map((jobItem) => [jobItem.id, labelForJob(jobItem)]), true)}
      <div class="field full">
        <label>Customer folder from Google Drive for Desktop
          <input name="files" type="file" multiple webkitdirectory directory accept=".pdf,.nc,.cnc,.tap,.gcode,application/pdf" required />
        </label>
        <p class="muted">Pick the main customer folder, for example the folder that contains the cut-sheet PDF and the material/CNC subfolders. The app scans inside the subfolders too.</p>
      </div>
      ${field("Material code override", "material_code", "text", params.material_code || "")}
      ${field("Material description", "material_description", "text", params.material_description || "")}
      ${field("Default physical runs per pattern", "required_run_quantity", "number", params.required_run_quantity || "1", "", true)}
      <div class="field full checkbox-field">
        <label>
          <input name="shared_pdf" type="checkbox" checked />
          Auto-select the cut-sheet PDF and link it to all matching NC files
        </label>
      </div>
      ${textareaField("Import notes", "revision_notes", "Customer folder scan / rescan", "full")}
      <section class="warning-panel full">
        <strong>How to use:</strong> choose the customer folder from your synced Google Drive folder on this PC. Run List will find PDF and NC files inside that folder and its subfolders.<br><br>
        <strong>Cut-sheet PDF:</strong> If there is one PDF, it uses that. If there are several, it prefers names like <strong>sheets.pdf</strong>, <strong>cut sheet</strong>, or a PDF in the main customer folder. If it cannot safely tell, it will ask you to rename the cut-sheet PDF to <strong>sheets.pdf</strong> and scan again.<br><br>
        <strong>Rescan:</strong> Choose the same customer folder again later to pick up remakes, new NC files, or changed files. Old versions are kept and changes are flagged for review.
      </section>
      <div class="form-actions full">
        <button class="primary-action" type="submit">Scan customer folder</button>
        <a class="ghost-button" href="${selectedJobId ? `#/jobs/${encodeURIComponent(selectedJobId)}` : "#/workshop"}">Cancel</a>
      </div>
    </form>
  `;
  document.getElementById("folderImportForm").addEventListener("submit", handleFolderImportSubmit);
}

async function handleFolderImportSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const submit = form.querySelector("button[type='submit']");
  submit.disabled = true;
  submit.textContent = "Scanning customer folder...";
  try {
    const formData = new FormData(form);
    const jobId = formData.get("job_id");
    const jobItem = jobById(jobId);
    if (!jobItem) throw new Error("Choose a job.");
    const files = [...form.querySelector("input[type='file']").files]
      .filter((file) => fileKindForName(file.name));
    if (!files.length) throw new Error("No PDF or CNC files found in that folder.");
    const result = await importMaterialFolderForJob(jobItem, files, Object.fromEntries(formData.entries()));
    saveState();
    const sharedMessage = result.sharedPdf ? ` Linked ${result.selectedPdfName || "the cut-sheet PDF"} to all imported NC patterns.` : "";
    toast(`Customer folder imported: ${result.patterns} pattern(s), ${result.files} file(s).${sharedMessage}`);
    navigate(`/jobs/${jobId}`);
  } catch (error) {
    toast(error.message);
    submit.disabled = false;
    submit.textContent = "Scan customer folder";
  }
}

function chooseCustomerCutSheetPdf(files) {
  const pdfFiles = files.filter((file) => fileKindForName(file.name) === "pdf");
  if (!pdfFiles.length) return null;
  if (pdfFiles.length === 1) return pdfFiles[0];
  const scored = pdfFiles.map((file) => {
    const name = String(file.name || "").toLowerCase();
    const relativePath = String(file.webkitRelativePath || file.name || "").toLowerCase();
    const depth = relativePath.split("/").filter(Boolean).length;
    let score = 0;
    if (/^sheets?\.pdf$/i.test(file.name)) score += 10;
    if (/(cut\s*sheet|cutsheet|sheet\s*cut|mozaik|pattern|nest)/i.test(file.name)) score += 6;
    if (/sheet/i.test(file.name)) score += 3;
    if (depth <= 2) score += 4;
    if (/(mozaik|cnc|export|cut)/i.test(relativePath)) score += 2;
    if (/(quote|invoice|render|drawing|install|photo|order|supplier|spec)/i.test(relativePath)) score -= 8;
    return { file, score, depth };
  }).sort((a, b) => b.score - a.score || a.depth - b.depth || a.file.name.localeCompare(b.file.name));
  if (scored[0]?.score >= 4 && (!scored[1] || scored[0].score > scored[1].score)) return scored[0].file;
  const rootPdfs = scored.filter((item) => item.depth <= 2);
  if (rootPdfs.length === 1) return rootPdfs[0].file;
  return null;
}

async function importMaterialFolderForJob(jobItem, files, manual = {}) {
  const pdfFiles = files.filter((file) => fileKindForName(file.name) === "pdf");
  const ncFiles = files.filter((file) => fileKindForName(file.name) === "nc");
  const selectedSharedPdf = manual.shared_pdf === "on" ? chooseCustomerCutSheetPdf(files) : null;
  const sharedPdfMode = Boolean(selectedSharedPdf && ncFiles.length > 0);
  let importedFiles = 0;
  let importedPatterns = 0;

  if (manual.shared_pdf === "on" && !selectedSharedPdf && pdfFiles.length > 1 && ncFiles.length > 0) {
    throw new Error(`I found ${pdfFiles.length} PDFs and could not safely tell which one is the Mozaik cut-sheet PDF. Rename the correct one to sheets.pdf, then scan the customer folder again.`);
  }

  if (sharedPdfMode) {
    const sharedParsed = parseMozaikFilename(selectedSharedPdf.name);
    if (manual.material_code) sharedParsed.material_code = String(manual.material_code).trim().toUpperCase();
    sharedParsed.material_code ||= "SHARED";
    sharedParsed.pattern_number = normalizePatternNumber(sharedParsed.pattern_number || "S01");
    sharedParsed.filename_revision = normalizeRevisionNumber(sharedParsed.filename_revision || "R01");
    const sharedPdf = await storeWorkshopFile(jobItem, selectedSharedPdf, sharedParsed);
    importedFiles += 1;
    for (const file of ncFiles) {
      const parsed = parseMozaikFilename(file.name);
      if (manual.material_code) parsed.material_code = String(manual.material_code).trim().toUpperCase();
      if (manual.material_description) parsed.material_description = String(manual.material_description).trim();
      parsed.material_code ||= sharedParsed.material_code || "UNKNOWN";
      parsed.material_description ||= manual.material_description || materialDescriptionFromCode(parsed.material_code);
      parsed.thickness ||= thicknessFromMaterialCode(parsed.material_code);
      parsed.pattern_number = normalizePatternNumber(parsed.pattern_number || "S01");
      parsed.filename_revision = normalizeRevisionNumber(parsed.filename_revision || sharedParsed.filename_revision || "R01");
      const nc = await storeWorkshopFile(jobItem, file, parsed);
      importedFiles += 1;
      importCutFileGroup(jobItem, { parsed, pdf: sharedPdf, nc }, manual);
      importedPatterns += 1;
    }
    return { files: importedFiles, patterns: importedPatterns, sharedPdf: true, selectedPdfName: selectedSharedPdf.name };
  }

  await importCutFilesForJob(jobItem, files, manual);
  return {
    files: files.length,
    patterns: new Set(files.map((file) => {
      const parsed = parseMozaikFilename(file.name);
      return `${parsed.material_code || manual.material_code || "UNKNOWN"}|${normalizePatternNumber(parsed.pattern_number || "S01")}|${normalizeRevisionNumber(parsed.filename_revision || "R01")}`;
    })).size,
    sharedPdf: false,
  };
}

function renderDymoLabelPrintForm(params = {}) {
  const selectedJobId = params.job_id || "";
  setTitle("Dymo Labels");
  const jobOptions = state.jobs.filter((jobItem) => jobItem.active).map((jobItem) => [jobItem.id, labelForJob(jobItem)]);
  app.innerHTML = `
    <section class="panel form-grid dymo-label-panel">
      <div class="full">
        <h2>Print Dymo 11352 part labels</h2>
        <p class="muted">Upload a Mozaik cut-sheet PDF. Run List reads the part table, uses the banding numbers as arrows, and prints labels relative to the PDF sheet picture.</p>
      </div>
      ${selectField("Job", "job_id", selectedJobId, jobOptions, false)}
      <div class="field">
        <label>Mozaik cut-sheet PDF
          <input id="dymoPdfFile" type="file" accept="application/pdf,.pdf" required />
        </label>
      </div>
      <div class="field">
        <label>Edge order from Band column
          <select id="dymoEdgeOrder">
            <option value="left,top,right,bottom" ${dymoLabelState.edgeOrder === "left,top,right,bottom" ? "selected" : ""}>Left, Top, Right, Bottom</option>
            <option value="top,right,bottom,left" ${dymoLabelState.edgeOrder === "top,right,bottom,left" ? "selected" : ""}>Top, Right, Bottom, Left</option>
            <option value="left,right,top,bottom" ${dymoLabelState.edgeOrder === "left,right,top,bottom" ? "selected" : ""}>Left, Right, Top, Bottom</option>
          </select>
        </label>
      </div>
      <div class="field">
        <label>Print selection
          <select id="dymoSheetFilter">
            ${sheetOptionsForDymoLabels()}
          </select>
        </label>
      </div>
      <div class="field checkbox-field">
        <label>
          <input id="dymoIncludeSeparators" type="checkbox" ${dymoLabelState.includeSeparators ? "checked" : ""} />
          Add separator label with sheet number and material
        </label>
      </div>
      <div class="form-actions full">
        <button class="primary-action" id="dymoParseButton" type="button">Read PDF</button>
        <button class="ghost-button" id="dymoPrintButton" type="button" ${dymoLabelState.labels.length ? "" : "disabled"}>Print labels</button>
        <a class="ghost-button" href="${selectedJobId ? `#/jobs/${encodeURIComponent(selectedJobId)}` : "#/workshop"}">Back</a>
      </div>
      <section class="warning-panel full">
        <strong>Label rule:</strong> arrows are relative to the PDF sheet picture. Non-zero banding numbers print arrows; zero prints nothing. Default order is <strong>left, top, right, bottom</strong>.
      </section>
      <p class="muted full" id="dymoLabelStatus">${dymoLabelState.labels.length ? `${dymoLabelState.labels.length} label(s) ready.` : "Choose a PDF and click Read PDF."}</p>
    </section>
    <section class="panel full dymo-preview-panel">
      <div class="section-heading">
        <h2>Preview</h2>
        <span class="count-pill">Dymo 11352</span>
      </div>
      <div id="dymoLabelPreview"></div>
    </section>
  `;
  bindDymoLabelPrinter();
  renderDymoLabelPreview();
}

function bindDymoLabelPrinter() {
  document.getElementById("dymoParseButton")?.addEventListener("click", handleDymoPdfParse);
  document.getElementById("dymoPrintButton")?.addEventListener("click", () => window.print());
  document.getElementById("dymoSheetFilter")?.addEventListener("change", (event) => {
    dymoLabelState.sheetFilter = event.target.value;
    renderDymoLabelPreview();
  });
  document.getElementById("dymoIncludeSeparators")?.addEventListener("change", (event) => {
    dymoLabelState.includeSeparators = event.target.checked;
    renderDymoLabelPreview();
  });
  document.getElementById("dymoEdgeOrder")?.addEventListener("change", (event) => {
    dymoLabelState.edgeOrder = event.target.value;
    dymoLabelState.labels = dymoLabelState.labels.map((label) => ({
      ...label,
      edges: edgesFromBandValues(label.bandValues, dymoLabelState.edgeOrder),
    }));
    renderDymoLabelPreview();
  });
}

async function handleDymoPdfParse() {
  const fileInput = document.getElementById("dymoPdfFile");
  const button = document.getElementById("dymoParseButton");
  const file = fileInput?.files?.[0];
  if (!file) return toast("Choose a PDF first.");
  button.disabled = true;
  button.textContent = "Reading PDF...";
  setDymoLabelStatus("Reading Mozaik PDF...");
  try {
    const labels = await parseDymoLabelsFromPdf(file);
    if (!labels.length) throw new Error("No Mozaik part rows found. Check this is the cut-sheet PDF with the Part# table.");
    dymoLabelState.labels = labels;
    dymoLabelState.sheetFilter = "all";
    document.getElementById("dymoSheetFilter").innerHTML = sheetOptionsForDymoLabels();
    document.getElementById("dymoPrintButton").disabled = false;
    renderDymoLabelPreview();
    setDymoLabelStatus(`${labels.length} label(s) ready from ${new Set(labels.map((label) => label.sheetKey)).size} sheet(s).`);
    toast("Dymo labels ready.");
  } catch (error) {
    setDymoLabelStatus(error.message);
    toast(error.message);
  } finally {
    button.disabled = false;
    button.textContent = "Read PDF";
  }
}

function setDymoLabelStatus(message) {
  const status = document.getElementById("dymoLabelStatus");
  if (status) status.textContent = message;
}

async function ensurePdfJsModule() {
  if (pdfJsModule) return pdfJsModule;
  pdfJsModule = await import("./vendor/pdfjs/pdf.min.mjs");
  pdfJsModule.GlobalWorkerOptions.workerSrc = new URL("./vendor/pdfjs/pdf.worker.min.mjs", location.href).toString();
  return pdfJsModule;
}

async function parseDymoLabelsFromPdf(file) {
  const pdfjs = await ensurePdfJsModule();
  const data = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data }).promise;
  const labels = [];
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const lines = await extractPdfTextLines(page);
    const text = lines.join("\n");
    const materialMatch = text.match(/Material:\s*(.+?)\s+Rev\s+#\d+\s+Pattern\s+#(\d+)\s+Sheets:\s*(\d+)/i);
    const material = materialMatch?.[1]?.trim() || "Unknown Material";
    const patternNumber = materialMatch?.[2] || String(pageNumber);
    const drawingText = text.split(/Part#\s+Name\s+Width\s+Length\s+Band\s+Cab#\s+Comment/i)[0] || "";
    const shortLabels = extractDrawingShortLabels(drawingText);
    const rows = extractMozaikPartRows(lines);
    rows.forEach((row) => {
      const bandValues = parseBandValues(row.band);
      const shortCode = shortLabels[row.partNumber] || `${formatCabForDymo(row.cab)} ${shortPartCodeFromName(row.name)}`.trim();
      labels.push({
        id: `dymo-${pageNumber}-${row.partNumber}`,
        sheetKey: `${pageNumber}`,
        sheetNumber: pageNumber,
        patternNumber,
        material,
        partNumber: row.partNumber,
        partName: row.name,
        cab: row.cab,
        code: shortCode.toUpperCase(),
        width: row.width,
        length: row.length,
        dimensions: `${row.width} x ${row.length}`,
        band: row.band,
        bandValues,
        edges: edgesFromBandValues(bandValues, dymoLabelState.edgeOrder),
        isRemake: /\b(remake|rmk|remade)\b/i.test(`${row.name} ${row.comment}`),
      });
    });
  }
  return labels;
}

async function extractPdfTextLines(page) {
  const content = await page.getTextContent({ disableCombineTextItems: false });
  const rawItems = content.items
    .map((item) => ({ text: String(item.str || "").trim(), x: item.transform[4], y: item.transform[5] }))
    .filter((item) => item.text);
  const lineGroups = [];
  rawItems.forEach((item) => {
    let group = lineGroups.find((candidate) => Math.abs(candidate.y - item.y) < 3);
    if (!group) {
      group = { y: item.y, items: [] };
      lineGroups.push(group);
    }
    group.items.push(item);
  });
  return lineGroups
    .sort((a, b) => b.y - a.y)
    .map((line) => line.items.sort((a, b) => a.x - b.x).map((item) => item.text).join(" ").replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function extractMozaikPartRows(lines) {
  const rows = [];
  let inTable = false;
  lines.forEach((line) => {
    if (/^Part#\s+Name\s+Width\s+Length\s+Band\s+Cab#\s+Comment/i.test(line)) {
      inTable = true;
      return;
    }
    if (!inTable) return;
    if (/^Page\s+\d+\s+of\s+\d+/i.test(line)) {
      inTable = false;
      return;
    }
    const match = line.match(/^(\d+)\s+(.+?)\s+([\d,.]+)\s+([\d,.]+)\s+(None|[A-Z]-\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*\d+)\s+(R\d+(?:F\d+)?C\d+)\b\s*(.*)$/i);
    if (!match) return;
    rows.push({
      partNumber: match[1],
      name: match[2].trim(),
      width: match[3],
      length: match[4],
      band: match[5].replace(/\s+/g, ""),
      cab: match[6],
      comment: match[7] || "",
    });
  });
  return rows;
}

function extractDrawingShortLabels(drawingText) {
  const labels = {};
  const flat = drawingText.replace(/\s+/g, " ");
  const pattern = /\b(R\d+(?:F\d+)?C\d+)\s+([A-Za-z][A-Za-z0-9]{1,10})\s+#\s*(\d+)\b/g;
  let match;
  while ((match = pattern.exec(flat))) {
    labels[match[3]] = `${formatCabForDymo(match[1])} ${match[2]}`.trim();
  }
  return labels;
}

function formatCabForDymo(cab) {
  const text = String(cab || "").toUpperCase();
  let match = text.match(/^R1C(\d+)$/);
  if (match) return `C${match[1]}`;
  match = text.match(/^R1F(\d+)C(\d+)$/);
  if (match) return `F${match[1]}C${match[2]}`;
  return text;
}

function shortPartCodeFromName(name) {
  const text = String(name || "");
  if (/UEnd\s*\(L\)/i.test(text)) return "UEL";
  if (/UEnd\s*\(R\)/i.test(text)) return "UER";
  if (/UBack/i.test(text)) return "UB";
  if (/Drw\s+Bottom/i.test(text)) return "DBM";
  if (/Drw\s+Back/i.test(text)) return "DBA";
  if (/Drawer/i.test(text)) return "DWR";
  if (/Front\s+Stretcher/i.test(text)) return "FRS";
  if (/Rear\s+Stretcher/i.test(text)) return "RRS";
  if (/Adjustable\s+Shelf/i.test(text)) return "ADJSH";
  if (/Subpanel/i.test(text)) return "SUB";
  if (/Nailer/i.test(text)) return "NA";
  if (/Bottom/i.test(text)) return "BOT";
  if (/Door\s*\(R\)/i.test(text)) return "DOORR";
  if (/Door\s*\(L\)/i.test(text)) return "DOORL";
  if (/Panel/i.test(text)) return "PAN";
  return text.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part.replace(/[^A-Za-z0-9]/g, "").slice(0, 5)).join("").toUpperCase() || "PART";
}

function parseBandValues(band) {
  if (!band || /^None$/i.test(band)) return [0, 0, 0, 0];
  const values = String(band).replace(/^[A-Z]-/i, "").split(",").map((value) => Number(value.trim()) || 0);
  while (values.length < 4) values.push(0);
  return values.slice(0, 4);
}

function edgesFromBandValues(values, orderText) {
  const edges = { left: false, top: false, right: false, bottom: false };
  const order = String(orderText || "left,top,right,bottom").split(",");
  order.forEach((side, index) => {
    if (side in edges) edges[side] = Number(values[index] || 0) > 0;
  });
  return edges;
}

function sheetOptionsForDymoLabels() {
  const selected = dymoLabelState.sheetFilter || "all";
  const sheets = [...new Map(dymoLabelState.labels.map((label) => [label.sheetKey, label])).values()];
  return [
    `<option value="all" ${selected === "all" ? "selected" : ""}>All sheets</option>`,
    ...sheets.map((label) => `<option value="${escapeAttr(label.sheetKey)}" ${selected === label.sheetKey ? "selected" : ""}>Sheet ${escapeHtml(label.sheetNumber)} - ${escapeHtml(label.material)}</option>`),
  ].join("");
}

function visibleDymoLabels() {
  if (dymoLabelState.sheetFilter === "all") return dymoLabelState.labels;
  return dymoLabelState.labels.filter((label) => label.sheetKey === dymoLabelState.sheetFilter);
}

function renderDymoLabelPreview() {
  const target = document.getElementById("dymoLabelPreview");
  if (!target) return;
  if (!dymoLabelState.labels.length) {
    target.innerHTML = empty("No labels parsed yet.");
    return;
  }
  target.innerHTML = `
    <div class="dymo-preview-help muted">Preview uses the same layout as print. Use browser print and select the Dymo 11352 / 54 x 25mm label.</div>
    <div id="dymoPrintArea" class="dymo-print-area">
      ${renderDymoPrintableLabels()}
    </div>
  `;
}

function renderDymoPrintableLabels() {
  const labels = visibleDymoLabels();
  const groups = labels.reduce((result, label) => {
    result[label.sheetKey] ||= [];
    result[label.sheetKey].push(label);
    return result;
  }, {});
  return Object.entries(groups).map(([sheetKey, sheetLabels]) => {
    const first = sheetLabels[0];
    return `
      ${dymoLabelState.includeSeparators ? renderDymoSeparatorLabel(first) : ""}
      ${sheetLabels.map(renderDymoPartLabel).join("")}
    `;
  }).join("");
}

function renderDymoSeparatorLabel(label) {
  return `
    <article class="dymo-label dymo-separator-label">
      <div class="separator-stars">**************</div>
      <div class="separator-sheet">SHEET ${escapeHtml(label.sheetNumber)}</div>
      <div class="separator-material">${escapeHtml(label.material.toUpperCase())}</div>
      <div class="separator-stars">**************</div>
    </article>
  `;
}

function renderDymoPartLabel(label) {
  const edges = label.edges || {};
  return `
    <article class="dymo-label dymo-part-label" data-label-id="${escapeAttr(label.id)}">
      <div class="dymo-arrow dymo-arrow-up">${edges.top ? "&uarr;" : ""}</div>
      <div class="dymo-main-row">
        <span class="dymo-arrow dymo-arrow-left">${edges.left ? "&larr;" : ""}</span>
        <span class="dymo-part-code">${label.isRemake ? '<span class="dymo-remake">REMAKE</span>' : ""}${escapeHtml(label.code)}</span>
        <span class="dymo-arrow dymo-arrow-right">${edges.right ? "&rarr;" : ""}</span>
      </div>
      <div class="dymo-arrow dymo-arrow-down">${edges.bottom ? "&darr;" : ""}</div>
      <div class="dymo-dimensions">${escapeHtml(label.dimensions)}</div>
    </article>
  `;
}
function importCutFileGroup(jobItem, group, manual = {}) {
  const pattern = getOrCreateCutPattern(jobItem.id, group.parsed);
  const current = currentCutRevisionForPattern(pattern.id);
  const required = Math.max(1, Number(manual.required_run_quantity || current?.required_run_quantity || 1));
  const sameRevision = current && current.filename_revision === group.parsed.filename_revision;
  const changedSameName = sameRevision && (
    (group.pdf && current.pdf_file_id && current.file_hash_pdf && current.file_hash_pdf !== group.pdf.file_hash) ||
    (group.nc && current.nc_file_id && current.file_hash_nc && current.file_hash_nc !== group.nc.file_hash)
  );
  const attachMissing = sameRevision && !changedSameName && (
    (group.pdf && !current.pdf_file_id) ||
    (group.nc && !current.nc_file_id)
  );
  if (attachMissing) {
    if (group.pdf) {
      current.pdf_file_id = group.pdf.id;
      current.pdf_filename = group.pdf.original_filename;
      current.file_hash_pdf = group.pdf.file_hash;
    }
    if (group.nc) {
      current.nc_file_id = group.nc.id;
      current.nc_filename = group.nc.original_filename;
      current.file_hash_nc = group.nc.file_hash;
    }
    current.production_status = calculateProductionStatus(current);
    current.updated_at = nowIso();
    pattern.status = current.production_status;
    pattern.updated_at = nowIso();
    logActivity(jobItem.id, "cut_pattern_revision", current.id, "PDF/NC paired", "", `${current.pdf_filename || "PDF missing"} + ${current.nc_filename || "NC missing"}`);
    return;
  }
  const previousHadCuts = current && Number(current.completed_run_quantity || 0) > 0;
  const revision = createCutPatternRevision({
    cut_pattern_id: pattern.id,
    job_id: jobItem.id,
    filename_revision: group.parsed.filename_revision,
    internal_revision: nextInternalRevision(pattern.id),
    required_run_quantity: required,
    pdf_file_id: group.pdf?.id || "",
    nc_file_id: group.nc?.id || "",
    pdf_filename: group.pdf?.original_filename || "",
    nc_filename: group.nc?.original_filename || "",
    file_hash_pdf: group.pdf?.file_hash || "",
    file_hash_nc: group.nc?.file_hash || "",
    revision_notes: manual.revision_notes || "",
    review_required: Boolean(changedSameName || previousHadCuts),
    review_reason: changedSameName ? "File changed without a filename revision increase." : previousHadCuts ? "Previous revision already has completed runs. Review remaining quantity." : "",
  });
  revision.production_status = calculateProductionStatus(revision);
  state.cut_pattern_revisions.unshift(revision);
  if (revision.review_required) {
    revision.is_current = false;
    logActivity(jobItem.id, "cut_pattern_revision", revision.id, "Revision imported for review", current?.id || "", revision.id, revision.review_reason);
  } else {
    makeRevisionCurrent(pattern, revision);
    logActivity(jobItem.id, "cut_pattern_revision", revision.id, "Current revision changed", current?.id || "", revision.id);
  }
}

function renderRemakeForm(params = {}, id = null) {
  const editing = id ? remakeById(id) : null;
  const jobId = editing?.job_id || params.job_id || "";
  const revisionId = editing?.source_cut_pattern_revision_id || params.revision_id || "";
  const remake = editing || createRemakeRequest({ job_id: jobId, source_cut_pattern_revision_id: revisionId });
  setTitle(editing ? "Edit Remake" : "Add Remake");
  app.innerHTML = `
    <form class="panel form-grid" id="remakeForm">
      ${selectField("Job", "job_id", remake.job_id, state.jobs.filter((jobItem) => jobItem.active).map((jobItem) => [jobItem.id, labelForJob(jobItem)]), true)}
      ${field("Quantity", "quantity", "number", remake.quantity || 1, "", true)}
      ${selectField("Priority", "priority", remake.priority || "normal", PRIORITY_OPTIONS)}
      ${field("Part number", "part_number", "text", remake.part_number)}
      ${field("Part name", "part_name", "text", remake.part_name)}
      ${field("Description", "description", "text", remake.description, "full")}
      ${field("Cabinet number", "cabinet_number", "text", remake.cabinet_number)}
      ${field("Required by", "required_by", "date", remake.required_by)}
      ${field("Material code", "material_code", "text", remake.material_code)}
      ${field("Thickness", "thickness", "text", remake.thickness)}
      ${field("Width", "width", "text", remake.width)}
      ${field("Length", "length", "text", remake.length)}
      ${field("Banding", "banding", "text", remake.banding)}
      ${selectField("Reason", "reason", remake.reason || "other", REMAKE_REASON_OPTIONS)}
      ${selectField("Damage stage", "damage_stage", remake.damage_stage || "unknown", DAMAGE_STAGE_OPTIONS)}
      ${selectField("Status", "status", remake.status || "waiting_to_add_to_mozaik", REMAKE_STATUS_OPTIONS)}
      ${field("Assigned person", "assigned_person", "text", remake.assigned_person)}
      ${field("Photo URL", "photo_url", "url", remake.photo_url, "full")}
      ${textareaField("Notes", "notes", remake.notes, "full")}
      <input type="hidden" name="source_cut_pattern_revision_id" value="${escapeAttr(revisionId)}" />
      <input type="hidden" name="destination_cut_pattern_revision_id" value="${escapeAttr(editing?.destination_cut_pattern_revision_id || "")}" />
      <div class="form-actions full">
        <button class="primary-action" type="submit">${editing ? "Save remake" : "Create remake"}</button>
        <a class="ghost-button" href="${jobId ? `#/jobs/${encodeURIComponent(jobId)}` : "#/workshop"}">Cancel</a>
      </div>
    </form>
  `;
  document.getElementById("remakeForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    if (!values.part_number && !values.part_name && !values.description) {
      toast("Enter a part number, part name, or short description.");
      return;
    }
    if (editing) {
      const previous = editing.status;
      Object.assign(editing, values, {
        quantity: Number(values.quantity || 1),
        updated_at: nowIso(),
      });
      applyRemakeStatusDates(editing, previous);
      logActivity(editing.job_id, "remake_request", editing.id, "Remake updated", previous, editing.status);
    } else {
      const next = createRemakeRequest(values);
      applyRemakeStatusDates(next, "");
      state.remake_requests.unshift(next);
      logActivity(next.job_id, "remake_request", next.id, "Remake created", "", next.part_number || next.part_name || next.description, "", next.reason);
    }
    saveState();
    navigate(values.job_id ? `/jobs/${values.job_id}` : "/workshop");
  });
}

function markRunsCut(revisionId, quantity) {
  const revision = cutRevisionById(revisionId);
  if (!revision) return;
  if (revision.is_superseded || !revision.is_current) return toast("Superseded — Do Not Cut. Use the current revision.");
  if (!(revision.pdf_file_id && revision.nc_file_id)) return toast("PDF and NC file are required before cutting.");
  const required = Number(revision.required_run_quantity || 0);
  const completed = Number(revision.completed_run_quantity || 0);
  if (completed + quantity > required) return toast(`Only ${required - completed} run(s) remaining.`);
  const note = quantity > 1 ? window.prompt("Optional note for these runs", "") || "" : "";
  for (let index = 1; index <= quantity; index += 1) {
    state.cut_runs.unshift(createCutRun({
      cut_pattern_revision_id: revisionId,
      run_number: completed + index,
      notes: note,
    }));
  }
  revision.completed_run_quantity = completed + quantity;
  revision.production_status = calculateProductionStatus(revision);
  revision.updated_at = nowIso();
  const pattern = cutPatternById(revision.cut_pattern_id);
  if (pattern) {
    pattern.status = revision.production_status;
    pattern.updated_at = nowIso();
  }
  logActivity(revision.job_id, "cut_pattern_revision", revision.id, quantity > 1 ? "Multiple physical runs completed" : "Physical run completed", completed, revision.completed_run_quantity, "", note);
  const linkedRemakes = openRemakes().filter((item) => item.destination_cut_pattern_revision_id === revision.id);
  if (linkedRemakes.length) {
    toast("Run cut. Linked remakes still need operator confirmation.");
  } else {
    toast(`${revision.completed_run_quantity} of ${revision.required_run_quantity} cut.`);
  }
  saveState();
  render();
}

async function deleteWorkshopFile(fileId) {
  const file = jobFileById(fileId);
  if (!file) return toast("File not found.");
  const linkedRevisions = cutRevisionsUsingFile(fileId);
  const usage = file.file_kind === "pdf" ? pdfUsageSummary(fileId) : null;
  const sharedWarning = usage?.patternCount > 1 ? `\n\nThis looks like a shared/all-sheets PDF used by ${usage.patternCount} patterns.` : "";
  const confirmed = window.confirm(`Remove ${file.file_kind?.toUpperCase() || "file"}: ${file.original_filename}?\n\nThis will unlink it from ${linkedRevisions.length} revision(s) and mark affected patterns as needing the correct file re-imported.${sharedWarning}\n\nThe original file on your computer will not be deleted.`);
  if (!confirmed) return;

  linkedRevisions.forEach((revision) => {
    let changed = false;
    if (revision.pdf_file_id === fileId) {
      revision.pdf_file_id = "";
      revision.pdf_filename = "";
      revision.file_hash_pdf = "";
      changed = true;
    }
    if (revision.nc_file_id === fileId) {
      revision.nc_file_id = "";
      revision.nc_filename = "";
      revision.file_hash_nc = "";
      changed = true;
    }
    if (!changed) return;
    revision.production_status = calculateProductionStatus(revision);
    revision.review_required = true;
    revision.review_reason = `File removed: ${file.original_filename}. Re-import the correct ${file.file_kind?.toUpperCase() || "file"}.`;
    revision.updated_at = nowIso();
    const pattern = cutPatternById(revision.cut_pattern_id);
    if (pattern && pattern.current_revision_id === revision.id) {
      pattern.status = revision.production_status;
      pattern.updated_at = nowIso();
    }
  });

  state.job_files = state.job_files.filter((candidate) => candidate.id !== fileId);
  logActivity(file.job_id, "job_file", file.id, "Workshop file removed", file.original_filename, "", `${linkedRevisions.length} linked revision(s) updated`);
  saveState();
  if (dataStore?.deleteJobFile) {
    try {
      await remoteSaveQueue;
      await dataStore.deleteJobFile(fileId);
    } catch (error) {
      backendStatus.message = `Delete sync error: ${error.message}`;
      toast(backendStatus.message);
    }
  }
  render();
  toast("File removed. Re-import the correct file when ready.");
}

function updateRemakeStatus(remakeId, status) {
  const remake = remakeById(remakeId);
  if (!remake) return;
  const previous = remake.status;
  remake.status = status;
  remake.updated_at = nowIso();
  applyRemakeStatusDates(remake, previous);
  logActivity(remake.job_id, "remake_request", remake.id, "Remake status changed", previous, status);
  saveState();
  render();
}

function applyRemakeStatusDates(remake, previousStatus) {
  const now = nowIso();
  if (remake.status === previousStatus) return;
  if (remake.status === "added_to_mozaik") remake.added_to_mozaik_at ||= now;
  if (remake.status === "cut") {
    remake.cut_confirmed_at ||= now;
    remake.cut_confirmed_by ||= backendStatus.userEmail || "";
  }
  if (remake.status === "quality_check") remake.quality_checked_at ||= now;
  if (remake.status === "returned_to_job") remake.returned_to_job_at ||= now;
}

function createManualPatternForJob(jobId) {
  const materialCode = window.prompt("Material code", "16WHMR");
  if (!materialCode) return;
  const patternNumber = window.prompt("Pattern number", "S01") || "S01";
  const filenameRevision = window.prompt("Revision", "R01") || "R01";
  const requiredRunQuantity = Number(window.prompt("Required physical runs", "1") || "1");
  if (!Number.isInteger(requiredRunQuantity) || requiredRunQuantity < 1) return toast("Required runs must be a whole number.");
  const pattern = getOrCreateCutPattern(jobId, {
    material_code: materialCode,
    pattern_number: patternNumber,
  });
  const revision = createCutPatternRevision({
    cut_pattern_id: pattern.id,
    job_id: jobId,
    filename_revision: filenameRevision,
    internal_revision: nextInternalRevision(pattern.id),
    required_run_quantity: requiredRunQuantity,
  });
  revision.production_status = calculateProductionStatus(revision);
  state.cut_pattern_revisions.unshift(revision);
  makeRevisionCurrent(pattern, revision);
  logActivity(jobId, "cut_pattern_revision", revision.id, "Manual cut pattern created", "", `${materialCode} ${patternNumber}${filenameRevision}`);
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
  const toOrder = groups["Still to order"].length;
  const pickup = groups["Ready to collect"].length + groups["Pickup needed"].length;

  app.innerHTML = `
    <div class="stack mobile-page mobile-orders-page">
      <section class="mobile-page-intro">
        <div class="mobile-title-row"><div><p class="mobile-eyebrow">PROCUREMENT</p><h2>Orders</h2></div><a class="primary-action" href="#/add">+ Add item</a></div>
        <div class="mobile-stat-grid"><div><strong>${toOrder}</strong><span>Still to order</span></div><div><strong>${pickup}</strong><span>To collect</span></div></div>
      </section>
      ${Object.entries(groups).map(([heading, items]) => `
        <section class="mobile-list-section mobile-order-group">
          <div class="section-heading"><h2>${escapeHtml(heading)}</h2><span class="count-pill">${items.length}</span></div>
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

function fileExtension(filename) {
  const match = String(filename || "").toLowerCase().match(/\.([a-z0-9]+)$/);
  return match ? match[1] : "";
}

function fileKindForName(filename) {
  const ext = fileExtension(filename);
  if (ext === "pdf") return "pdf";
  if (CNC_FILE_EXTENSIONS.has(ext)) return "nc";
  return "";
}

function parseMozaikFilename(filename) {
  const original = String(filename || "").trim();
  const base = original.replace(/\.[^.]+$/, "");
  const parsed = {
    original_filename: original,
    file_kind: fileKindForName(original),
    job_name: "",
    material_code: "",
    material_description: "",
    thickness: "",
    pattern_number: "",
    filename_revision: "",
  };
  const match = base.match(/^(.*)_([^_]+)_(S\d+)(R\d+)$/i);
  if (match) {
    parsed.job_name = match[1].replace(/_+/g, " ").trim();
    parsed.material_code = match[2].toUpperCase();
    parsed.pattern_number = match[3].toUpperCase();
    parsed.filename_revision = match[4].toUpperCase();
    parsed.thickness = thicknessFromMaterialCode(parsed.material_code);
    parsed.material_description = materialDescriptionFromCode(parsed.material_code);
  }
  return parsed;
}

function normalizePatternNumber(value) {
  const raw = String(value || "").trim().toUpperCase();
  const number = raw.match(/\d+/)?.[0] || "1";
  return `S${String(Number(number)).padStart(2, "0")}`;
}

function normalizeRevisionNumber(value) {
  const raw = String(value || "").trim().toUpperCase();
  const number = raw.match(/\d+/)?.[0] || "1";
  return `R${String(Number(number)).padStart(2, "0")}`;
}

function thicknessFromMaterialCode(code) {
  return String(code || "").match(/^(\d+(?:\.\d+)?)/)?.[1] || "";
}

function materialDescriptionFromCode(code) {
  const materialCode = String(code || "").toUpperCase();
  if (!materialCode) return "";
  const thickness = thicknessFromMaterialCode(materialCode);
  const material = materialCode
    .replace(/^\d+(?:\.\d+)?/, "")
    .replace(/WHMR/g, " White HMR")
    .replace(/HMR/g, " HMR")
    .replace(/MR/g, " MR")
    .trim() || materialCode;
  return [thickness ? `${thickness}mm` : "", material].filter(Boolean).join(" ");
}

function calculateProductionStatus(revision) {
  if (revision.is_superseded) return "superseded";
  if (!(revision.pdf_file_id && revision.nc_file_id)) return "files_incomplete";
  if (Number(revision.completed_run_quantity || 0) <= 0) return "ready_for_cnc";
  if (Number(revision.completed_run_quantity || 0) >= Number(revision.required_run_quantity || 0)) return "cut_complete";
  return "partially_cut";
}

function getOrCreateCutPattern(jobId, details) {
  const materialCode = (details.material_code || "UNKNOWN").toUpperCase();
  const patternNumber = normalizePatternNumber(details.pattern_number || "S01");
  let pattern = state.cut_patterns.find((item) =>
    item.job_id === jobId &&
    item.material_code.toUpperCase() === materialCode &&
    item.pattern_number.toUpperCase() === patternNumber
  );
  if (pattern) return pattern;
  pattern = createCutPattern({
    job_id: jobId,
    material_code: materialCode,
    material_description: details.material_description || materialDescriptionFromCode(materialCode),
    thickness: details.thickness || thicknessFromMaterialCode(materialCode),
    pattern_number: patternNumber,
  });
  state.cut_patterns.unshift(pattern);
  logActivity(jobId, "cut_pattern", pattern.id, "Cut pattern created", "", `${materialCode} ${patternNumber}`);
  return pattern;
}

function nextInternalRevision(patternId) {
  return state.cut_pattern_revisions
    .filter((item) => item.cut_pattern_id === patternId)
    .reduce((max, item) => Math.max(max, Number(item.internal_revision || 0)), 0) + 1;
}

function makeRevisionCurrent(pattern, revision) {
  state.cut_pattern_revisions.forEach((candidate) => {
    if (candidate.cut_pattern_id !== pattern.id || candidate.id === revision.id || !candidate.is_current) return;
    candidate.is_current = false;
    candidate.is_superseded = true;
    candidate.production_status = candidate.completed_run_quantity > 0 && candidate.completed_run_quantity < candidate.required_run_quantity ? "partially_cut" : "superseded";
    candidate.updated_at = nowIso();
    logActivity(candidate.job_id, "cut_pattern_revision", candidate.id, "Revision superseded", "current", "superseded", "New current revision selected");
  });
  revision.is_current = true;
  revision.is_superseded = false;
  revision.review_required = false;
  revision.production_status = calculateProductionStatus(revision);
  revision.updated_at = nowIso();
  pattern.current_revision_id = revision.id;
  pattern.status = revision.production_status;
  pattern.updated_at = nowIso();
}

async function hashFile(file) {
  const buffer = await file.arrayBuffer();
  if (window.crypto?.subtle) {
    const digest = await crypto.subtle.digest("SHA-256", buffer);
    return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  }
  return `${file.name}-${file.size}-${file.lastModified}`;
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error(`Could not read ${file.name}`));
    reader.readAsDataURL(file);
  });
}

async function storeWorkshopFile(jobItem, file, parsed) {
  const hash = await hashFile(file);
  const existing = state.job_files.find((item) =>
    item.job_id === jobItem.id &&
    item.original_filename === file.name &&
    item.file_hash === hash &&
    item.file_kind === parsed.file_kind
  );
  if (existing) return existing;
  const ext = fileExtension(file.name);
  const internalName = [
    jobItem.job_number || jobItem.id,
    parsed.material_code || "UNKNOWN",
    `${parsed.pattern_number || "S01"}${parsed.filename_revision || "R01"}`,
    Date.now(),
    `${uid("f").replace(/[^a-z0-9]/gi, "")}.${ext}`,
  ].join("_");
  const storagePath = `${jobItem.id}/${internalName}`;
  let fileUrl = "";
  let storage_path = storagePath;
  try {
    if (dataStore?.uploadJobFile) {
      fileUrl = await dataStore.uploadJobFile(storagePath, file);
    } else {
      fileUrl = await fileToDataUrl(file);
      storage_path = "";
    }
  } catch (error) {
    fileUrl = await fileToDataUrl(file);
    storage_path = "";
    toast(`Storage upload failed; kept ${file.name} in local/browser data.`);
  }
  const record = createJobFile({
    job_id: jobItem.id,
    storage_path,
    file_url: fileUrl,
    file_kind: parsed.file_kind,
    original_filename: file.name,
    internal_filename: internalName,
    file_hash: hash,
    file_size: file.size,
    mime_type: file.type || (parsed.file_kind === "pdf" ? "application/pdf" : "text/plain"),
  });
  state.job_files.unshift(record);
  return record;
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
