import { PrismaClient } from "@prisma/client";

// In-memory mock store for preview and environments without an external database
function createInMemoryPrisma(): any {
  console.warn("[AI Studio] Database not connected — using in-memory mock");

  const users = new Map<string, any>();
  const weddingPlans = new Map<string, any>();
  const roadmapTasks = new Map<string, any>();
  const budgetItems = new Map<string, any>();
  const vendors = new Map<string, any>();
  const documents = new Map<string, any>();
  const collaboratorInvites = new Map<string, any>();

  let idCounter = 1;
  const nextId = (prefix: string) => `${prefix}_${Date.now()}_${idCounter++}`;

  // Seed default demo data
  const demoUserId = "demo-user-1";
  const demoPlanId = "demo-plan-1";

  users.set(demoUserId, {
    id: demoUserId,
    name: "Rendra Mukuti",
    email: "rendra@example.com",
    password: "$2a$10$w8T0M4xYF5Oqv2g.6Vl4x.2sT81QJ8iQdM8G.wJ7D40.x642K8xre",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  weddingPlans.set(demoPlanId, {
    id: demoPlanId,
    ownerId: demoUserId,
    partnerName: "Sarah Azzahra",
    weddingDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // ~6 bulan ke depan
    venueCity: "Bandung",
    concept: "Modern Adat Sunda",
    budgetTotal: 160000000,
    guestCount: 350,
    religion: "Islam (KUA)",
    onboardingDone: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const initialRoadmap = [
    { phase: "H-12", title: "Sepakati konsep acara & plafon budget bersama pasangan", isDone: true, notes: "Plafon Rp 160jt, konsep Sunda modern" },
    { phase: "H-12", title: "Tentukan perkiraan jumlah tamu (guest list kasar)", isDone: true, notes: "Kira-kira 350 undangan (700 pax)" },
    { phase: "H-12", title: "Survey dan booking venue/gedung favorit", isDone: true, notes: "Bumi Sangkuriang Bandung sudah DP" },
    { phase: "H-6", title: "Booking Catering & test food bersama keluarga", isDone: true, notes: "Diva Catering dipilih setelah food tasting" },
    { phase: "H-6", title: "Booking MUA & vendor kebaya/jas pengantin", isDone: true, notes: "Griya Sanggar Anggun booked" },
    { phase: "H-6", title: "Booking Wedding Organizer (WO) hari-H", isDone: true, notes: "Satu Janji WO (6 crew)" },
    { phase: "H-6", title: "Pemeriksaan kesehatan pranikah (MCU) & Elsimil", isDone: false, notes: "Jadwalkan di Puskesmas minggu depan" },
    { phase: "H-3", title: "Fitting pertama baju pengantin & seragam keluarga", isDone: false, notes: "Jadwal fitting tanggal 15 bulan depan" },
    { phase: "H-3", title: "Beli cincin kawin emas & siapkan mahar", isDone: true, notes: "Cincin emas 10 gram sudah dipesan" },
    { phase: "H-3", title: "Ambil Surat Pengantar RT/RW & Form N1-N4 di Kelurahan", isDone: false, notes: "Syarat KTP & KK kedua belah pihak" },
    { phase: "H-3", title: "Daftar nikah ke KUA (SIMKAH Online)", isDone: false, notes: "Batas waktu paling lambat H-10 hari kerja" },
    { phase: "H-1", title: "Technical Meeting (TM) seluruh vendor di venue", isDone: false, notes: "Pimpin rundown bersama ketua panitia" },
    { phase: "H-1", title: "Cetak & sebar undangan fisik serta rilis digital", isDone: false, notes: "250 fisik + 150 broadcast WA" },
    { phase: "H-1", title: "Pelunasan sisa biaya vendor H-7", isDone: false, notes: "Siapkan transfer jadwal" },
    { phase: "Hari-H", title: "Gladi resik akad & briefing tim penerima tamu", isDone: false, notes: "Keluarga kumpul 1.5 jam sebelum akad" },
  ];

  initialRoadmap.forEach((item) => {
    const id = nextId("task");
    roadmapTasks.set(id, {
      id,
      weddingPlanId: demoPlanId,
      title: item.title,
      phase: item.phase,
      isDone: item.isDone,
      notes: item.notes,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  const initialBudget = [
    { category: "Venue & Catering", label: "Venue Gedung & Catering 350 Pax", estimatedCost: 70000000, actualCost: 68000000, isPaid: true },
    { category: "Dekorasi", label: "Dekorasi Pelaminan & Area Masuk Adat Sunda", estimatedCost: 20000000, actualCost: 19500000, isPaid: false },
    { category: "MUA & Busana", label: "MUA Pengantin + 2 Ibu + Busana Akad Resepsi", estimatedCost: 16000000, actualCost: 16000000, isPaid: true },
    { category: "Dokumentasi", label: "Foto & Video Cinematic Hari-H + Drone", estimatedCost: 13000000, actualCost: 12500000, isPaid: false },
    { category: "Wedding Organizer", label: "WO All-Day Koordinasi 6 Personel", estimatedCost: 10000000, actualCost: 10000000, isPaid: true },
    { category: "Cincin & Mahar", label: "Cincin Emas Platina & Kotak Seserahan", estimatedCost: 12000000, actualCost: 11800000, isPaid: true },
    { category: "Undangan & Souvenir", label: "250 Undangan Fisik + Web Digital + Souvenir", estimatedCost: 8000000, actualCost: 7500000, isPaid: false },
    { category: "Entertainment & MC", label: "Akustik Band Tradisional Modern & MC", estimatedCost: 6000000, actualCost: 6000000, isPaid: false },
    { category: "Dana Darurat", label: "Cadangan Operasional & Logistik Hari-H", estimatedCost: 5000000, actualCost: 2000000, isPaid: false },
  ];

  initialBudget.forEach((b) => {
    const id = nextId("bgt");
    budgetItems.set(id, {
      id,
      weddingPlanId: demoPlanId,
      category: b.category,
      label: b.label,
      estimatedCost: b.estimatedCost,
      actualCost: b.actualCost,
      isPaid: b.isPaid,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  const initialVendors = [
    { name: "Bumi Sangkuriang Bandung", category: "Venue", contact: "0812-2244-9988", status: "booked", dpAmount: 10000000, quotedPrice: 25000000, notes: "Kapasitas 400 pax, parkir luas, izin keramaian aman" },
    { name: "Diva Catering Nusantara", category: "Catering", contact: "0813-9876-5432", status: "booked", dpAmount: 15000000, quotedPrice: 43000000, notes: "Pilihan menu A + 5 gubukan, free ice carving" },
    { name: "Rasa Melati Catering", category: "Catering", contact: "0811-3322-1100", status: "riset", dpAmount: 0, quotedPrice: 46000000, notes: "Kandidat alternatif, rasa enak tapi minimum order 500 pax" },
    { name: "Griya Sanggar Anggun", category: "MUA & Busana", contact: "@sanggaranggun.bdg", status: "booked", dpAmount: 5000000, quotedPrice: 16000000, notes: "Melati siger asli, touch up 2x, baju akad + resepsi" },
    { name: "Lensa Kisah Visual", category: "Dokumentasi", contact: "0819-0123-4567", status: "nego", dpAmount: 0, quotedPrice: 12500000, notes: "Sedang nego bonus same-day edit teaser reels" },
    { name: "Momentum Fotografi", category: "Dokumentasi", contact: "@momentumfoto", status: "riset", dpAmount: 0, quotedPrice: 14000000, notes: "Portofolio bagus tapi harga di atas plafon awal" },
    { name: "Satu Janji WO", category: "Wedding Organizer", contact: "0857-1122-3344", status: "booked", dpAmount: 3000000, quotedPrice: 10000000, notes: "6 crew, handle dari technical meeting sampai rekap" },
  ];

  initialVendors.forEach((v) => {
    const id = nextId("vnd");
    vendors.set(id, {
      id,
      weddingPlanId: demoPlanId,
      name: v.name,
      category: v.category,
      contact: v.contact,
      status: v.status,
      dpAmount: v.dpAmount,
      quotedPrice: v.quotedPrice,
      notes: v.notes,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  const initialDocs = [
    { type: "KTP & Kartu Keluarga Kedua Mempelai", status: "verified", note: "Fotokopi dan asli sudah lengkap di map", deadlineDays: 90 },
    { type: "Akta Kelahiran & Ijazah Terakhir", status: "verified", note: "Untuk mencocokkan ejaan nama resmi", deadlineDays: 90 },
    { type: "Pas Foto Background Biru (2x3 & 4x6)", status: "ready", note: "Masing-masing 4 lembar sudah dicetak", deadlineDays: 60 },
    { type: "Surat Pengantar RT / RW", status: "ready", note: "Surat dari RT domisili calon pria dan wanita", deadlineDays: 45 },
    { type: "Formulir N1, N2, N4 dari Kelurahan", status: "ready", note: "Surat pengantar nikah dari kantor kelurahan", deadlineDays: 30 },
    { type: "Surat Rekomendasi Nikah (bila beda KUA)", status: "pending", note: "Diurus di KUA domisili asal pria", deadlineDays: 20 },
    { type: "Pendaftaran SIMKAH KUA Online", status: "pending", note: "Daftar di simkah4.kemenag.go.id (max H-10 hari kerja)", deadlineDays: 14 },
    { type: "Sertifikat Elsimil & MCU Pranikah", status: "ready", note: "Tes lab hemoglobin & vaksin TT di Puskesmas", deadlineDays: 30 },
    { type: "Sertifikat Bimbingan Perkawinan (Bimwin)", status: "pending", note: "Mengikuti kursus pranikah terjadwal", deadlineDays: 14 },
  ];

  initialDocs.forEach((d) => {
    const id = nextId("doc");
    documents.set(id, {
      id,
      weddingPlanId: demoPlanId,
      type: d.type,
      status: d.status,
      note: d.note,
      deadlineDays: d.deadlineDays,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  collaboratorInvites.set("collab-1", {
    id: "collab-1",
    weddingPlanId: demoPlanId,
    invitedEmail: "sarah.azzahra@example.com",
    role: "Pasangan",
    status: "accepted",
    createdAt: new Date(),
  });

  const userModel = {
    findUnique: async ({ where }: { where: { email?: string; id?: string } }) => {
      if (where.id) return users.get(where.id) || null;
      if (where.email) {
        for (const u of users.values()) {
          if (u.email.toLowerCase() === where.email.toLowerCase()) return u;
        }
      }
      return null;
    },
    create: async ({ data, select }: { data: any; select?: any }) => {
      const id = data.id || nextId("usr");
      const user = { ...data, id, createdAt: new Date(), updatedAt: new Date() };
      users.set(id, user);
      if (select) {
        const res: any = {};
        for (const k of Object.keys(select)) {
          if (select[k]) res[k] = user[k];
        }
        return res;
      }
      return user;
    },
    findFirst: async ({ where }: any = {}) => {
      for (const u of users.values()) {
        if (!where?.email || u.email === where.email) return u;
      }
      return null;
    },
    findMany: async () => Array.from(users.values()),
    update: async ({ where, data }: any) => {
      const u = users.get(where.id);
      if (!u) return null;
      const updated = { ...u, ...data, updatedAt: new Date() };
      users.set(where.id, updated);
      return updated;
    },
    delete: async ({ where }: any) => {
      const u = users.get(where.id);
      users.delete(where.id);
      return u;
    },
  };

  const weddingPlanModel = {
    findUnique: async ({ where }: { where: { ownerId?: string; id?: string } }) => {
      if (where.id) return weddingPlans.get(where.id) || null;
      if (where.ownerId) {
        for (const wp of weddingPlans.values()) {
          if (wp.ownerId === where.ownerId) return wp;
        }
      }
      return null;
    },
    findFirst: async ({ where }: { where?: { ownerId?: string; id?: string } } = {}) => {
      if (!where) return weddingPlans.values().next().value || null;
      if (where.id) return weddingPlans.get(where.id) || null;
      if (where.ownerId) {
        for (const wp of weddingPlans.values()) {
          if (wp.ownerId === where.ownerId) return wp;
        }
      }
      return null;
    },
    upsert: async ({
      where,
      update,
      create,
    }: {
      where: { ownerId?: string };
      update: any;
      create: any;
    }) => {
      let existing: any = null;
      if (where.ownerId) {
        for (const wp of weddingPlans.values()) {
          if (wp.ownerId === where.ownerId) {
            existing = wp;
            break;
          }
        }
      }
      if (existing) {
        const updated = { ...existing, ...update, updatedAt: new Date() };
        weddingPlans.set(existing.id, updated);
        return updated;
      } else {
        const id = nextId("wp");
        const created = { ...create, id, createdAt: new Date(), updatedAt: new Date() };
        weddingPlans.set(id, created);
        return created;
      }
    },
    create: async ({ data }: any) => {
      const id = data.id || nextId("wp");
      const created = { ...data, id, createdAt: new Date(), updatedAt: new Date() };
      weddingPlans.set(id, created);
      return created;
    },
    findMany: async () => Array.from(weddingPlans.values()),
  };

  const roadmapTaskModel = {
    findMany: async ({
      where,
    }: {
      where?: { weddingPlanId?: string };
      orderBy?: any;
    } = {}) => {
      let list = Array.from(roadmapTasks.values());
      if (where?.weddingPlanId) {
        list = list.filter((t) => t.weddingPlanId === where.weddingPlanId);
      }
      return list;
    },
    count: async ({ where }: { where?: { weddingPlanId?: string } } = {}) => {
      let list = Array.from(roadmapTasks.values());
      if (where?.weddingPlanId) {
        list = list.filter((t) => t.weddingPlanId === where.weddingPlanId);
      }
      return list.length;
    },
    findUnique: async ({ where }: { where: { id: string } }) => {
      return roadmapTasks.get(where.id) || null;
    },
    create: async ({ data }: { data: any }) => {
      const id = data.id || nextId("task");
      const task = {
        isDone: false,
        notes: null,
        ...data,
        id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      roadmapTasks.set(id, task);
      return task;
    },
    createMany: async ({ data }: { data: any[] }) => {
      for (const item of data) {
        const id = item.id || nextId("task");
        const task = {
          isDone: false,
          notes: null,
          ...item,
          id,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        roadmapTasks.set(id, task);
      }
      return { count: data.length };
    },
    update: async ({ where, data }: { where: { id: string }; data: any }) => {
      const existing = roadmapTasks.get(where.id);
      if (!existing) return null;
      const updated = { ...existing, ...data, updatedAt: new Date() };
      roadmapTasks.set(where.id, updated);
      return updated;
    },
    delete: async ({ where }: { where: { id: string } }) => {
      const existing = roadmapTasks.get(where.id);
      roadmapTasks.delete(where.id);
      return existing;
    },
  };

  const budgetItemModel = {
    findMany: async ({ where }: { where?: { weddingPlanId?: string } } = {}) => {
      let list = Array.from(budgetItems.values());
      if (where?.weddingPlanId) {
        list = list.filter((b) => b.weddingPlanId === where.weddingPlanId);
      }
      return list;
    },
    findUnique: async ({ where }: { where: { id: string } }) => {
      return budgetItems.get(where.id) || null;
    },
    create: async ({ data }: { data: any }) => {
      const id = data.id || nextId("bgt");
      const item = {
        isPaid: false,
        actualCost: null,
        ...data,
        id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      budgetItems.set(id, item);
      return item;
    },
    createMany: async ({ data }: { data: any[] }) => {
      for (const item of data) {
        const id = item.id || nextId("bgt");
        budgetItems.set(id, {
          isPaid: false,
          actualCost: null,
          ...item,
          id,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      return { count: data.length };
    },
    update: async ({ where, data }: { where: { id: string }; data: any }) => {
      const existing = budgetItems.get(where.id);
      if (!existing) return null;
      const updated = { ...existing, ...data, updatedAt: new Date() };
      budgetItems.set(where.id, updated);
      return updated;
    },
    delete: async ({ where }: { where: { id: string } }) => {
      const existing = budgetItems.get(where.id);
      budgetItems.delete(where.id);
      return existing;
    },
  };

  const vendorModel = {
    findMany: async ({ where }: { where?: { weddingPlanId?: string } } = {}) => {
      let list = Array.from(vendors.values());
      if (where?.weddingPlanId) {
        list = list.filter((v) => v.weddingPlanId === where.weddingPlanId);
      }
      return list;
    },
    findUnique: async ({ where }: { where: { id: string } }) => {
      return vendors.get(where.id) || null;
    },
    create: async ({ data }: { data: any }) => {
      const id = data.id || nextId("vnd");
      const item = {
        status: "riset",
        dpAmount: 0,
        notes: null,
        ...data,
        id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      vendors.set(id, item);
      return item;
    },
    update: async ({ where, data }: { where: { id: string }; data: any }) => {
      const existing = vendors.get(where.id);
      if (!existing) return null;
      const updated = { ...existing, ...data, updatedAt: new Date() };
      vendors.set(where.id, updated);
      return updated;
    },
    delete: async ({ where }: { where: { id: string } }) => {
      const existing = vendors.get(where.id);
      vendors.delete(where.id);
      return existing;
    },
  };

  const documentModel = {
    findMany: async ({ where }: { where?: { weddingPlanId?: string } } = {}) => {
      let list = Array.from(documents.values());
      if (where?.weddingPlanId) {
        list = list.filter((d) => d.weddingPlanId === where.weddingPlanId);
      }
      return list;
    },
    findUnique: async ({ where }: { where: { id: string } }) => {
      return documents.get(where.id) || null;
    },
    create: async ({ data }: { data: any }) => {
      const id = data.id || nextId("doc");
      const item = {
        status: "pending",
        note: null,
        fileUrl: null,
        ...data,
        id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      documents.set(id, item);
      return item;
    },
    createMany: async ({ data }: { data: any[] }) => {
      for (const item of data) {
        const id = item.id || nextId("doc");
        documents.set(id, {
          status: "pending",
          ...item,
          id,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      return { count: data.length };
    },
    update: async ({ where, data }: { where: { id: string }; data: any }) => {
      const existing = documents.get(where.id);
      if (!existing) return null;
      const updated = { ...existing, ...data, updatedAt: new Date() };
      documents.set(where.id, updated);
      return updated;
    },
    delete: async ({ where }: { where: { id: string } }) => {
      const existing = documents.get(where.id);
      documents.delete(where.id);
      return existing;
    },
  };

  const collaboratorInviteModel = {
    findMany: async ({ where }: { where?: { weddingPlanId?: string } } = {}) => {
      let list = Array.from(collaboratorInvites.values());
      if (where?.weddingPlanId) {
        list = list.filter((c) => c.weddingPlanId === where.weddingPlanId);
      }
      return list;
    },
    create: async ({ data }: { data: any }) => {
      const id = data.id || nextId("collab");
      const item = {
        status: "pending",
        role: "Pasangan",
        ...data,
        id,
        createdAt: new Date(),
      };
      collaboratorInvites.set(id, item);
      return item;
    },
    delete: async ({ where }: { where: { id: string } }) => {
      const existing = collaboratorInvites.get(where.id);
      collaboratorInvites.delete(where.id);
      return existing;
    },
  };

  const genericNoOp = {
    findMany: async () => [],
    findFirst: async () => null,
    findUnique: async () => null,
    create: async (d: any) => ({ id: nextId("item"), ...(d?.data ?? {}) }),
    createMany: async (d: any) => ({ count: d?.data?.length ?? 0 }),
    update: async (d: any) => d?.data ?? {},
    delete: async () => ({}),
    count: async () => 0,
    upsert: async (d: any) => d?.create ?? {},
  };

  const mockDb: any = {
    user: userModel,
    weddingPlan: weddingPlanModel,
    roadmapTask: roadmapTaskModel,
    budgetItem: budgetItemModel,
    vendor: vendorModel,
    document: documentModel,
    collaboratorInvite: collaboratorInviteModel,
    account: genericNoOp,
    session: genericNoOp,
    verificationToken: genericNoOp,
    $connect: async () => {},
    $disconnect: async () => {},
  };

  return new Proxy(mockDb, {
    get: (target, prop: string) => {
      if (prop in target) return target[prop];
      return genericNoOp;
    },
  });
}

const globalForPrisma = globalThis as unknown as { prisma: any; mockPrisma: any };

const mockPrisma = globalForPrisma.mockPrisma ?? createInMemoryPrisma();
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.mockPrisma = mockPrisma;
}

function createResilientPrisma(): any {
  // If no DATABASE_URL, directly use in-memory mock
  if (!process.env.DATABASE_URL) {
    return mockPrisma;
  }

  let realClient: PrismaClient;
  try {
    realClient =
      globalForPrisma.prisma ??
      new PrismaClient({
        log:
          process.env.NODE_ENV === "development"
            ? ["error", "warn"]
            : ["error"],
      });
    if (process.env.NODE_ENV !== "production") {
      globalForPrisma.prisma = realClient;
    }
  } catch (err) {
    console.warn("[AI Studio] Failed to construct PrismaClient, falling back to mock:", err);
    return mockPrisma;
  }

  let dbUnreachable = false;

  return new Proxy(realClient as object, {
    get(target: any, modelProp: string) {
      if (dbUnreachable) {
        return mockPrisma[modelProp];
      }

      const originalModel = target[modelProp];

      // If it's a function on client (like $connect, $disconnect)
      if (typeof originalModel === "function") {
        return async (...args: any[]) => {
          if (dbUnreachable) return (mockPrisma[modelProp] as any)?.(...args);
          try {
            return await originalModel.apply(target, args);
          } catch (err: any) {
            if (
              err?.name === "PrismaClientInitializationError" ||
              err?.message?.includes("Can't reach database server") ||
              err?.code === "P1001"
            ) {
              console.warn("[AI Studio] Database connection unavailable — seamlessly using in-memory store.");
              dbUnreachable = true;
              return (mockPrisma[modelProp] as any)?.(...args);
            }
            throw err;
          }
        };
      }

      if (!originalModel || typeof originalModel !== "object") {
        return originalModel ?? mockPrisma[modelProp];
      }

      return new Proxy(originalModel, {
        get(modelTarget: any, methodProp: string) {
          const originalMethod = modelTarget[methodProp];

          if (typeof originalMethod !== "function") {
            return originalMethod ?? mockPrisma[modelProp]?.[methodProp];
          }

          return async (...args: any[]) => {
            if (dbUnreachable) {
              const fallbackFn = mockPrisma[modelProp]?.[methodProp];
              return fallbackFn ? fallbackFn(...args) : null;
            }

            try {
              return await originalMethod.apply(modelTarget, args);
            } catch (err: any) {
              const isConnError =
                err?.name === "PrismaClientInitializationError" ||
                err?.message?.includes("Can't reach database server") ||
                err?.code === "P1001" ||
                err?.code === "P1000";

              if (isConnError) {
                console.warn(
                  `[AI Studio] Database connection failed during ${modelProp}.${methodProp} — seamlessly falling back to in-memory store.`
                );
                dbUnreachable = true;
                const fallbackFn = mockPrisma[modelProp]?.[methodProp];
                return fallbackFn ? fallbackFn(...args) : null;
              }
              throw err;
            }
          };
        },
      });
    },
  });
}

export const prisma = createResilientPrisma();

