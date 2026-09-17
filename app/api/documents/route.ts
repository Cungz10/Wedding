import { NextResponse } from "next/server";
import { getCurrentWeddingPlan } from "@/lib/current-plan";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { weddingPlan } = await getCurrentWeddingPlan();
  if (!weddingPlan) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const documents = await prisma.document.findMany({
    where: { weddingPlanId: weddingPlan.id },
  });

  return NextResponse.json({ documents });
}

export async function POST(request: Request) {
  const { weddingPlan } = await getCurrentWeddingPlan();
  if (!weddingPlan) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json();

  if (json.action === "seed_checklist") {
    const isIslam = (weddingPlan.religion || "Islam").includes("Islam");
    const defaultList = [
      { type: "KTP & Kartu Keluarga Kedua Calon Mempelai", note: "Asli & fotokopi rangkap 3", deadlineDays: 60 },
      { type: "Akta Kelahiran & Ijazah Terakhir", note: "Verifikasi ejaan nama & tanggal lahir", deadlineDays: 60 },
      { type: "Pas Foto Background Biru (Ukuran 2x3 & 4x6)", note: "Masing-masing 4 lembar formal rapi", deadlineDays: 45 },
      { type: "Surat Pengantar RT & RW Setempat", note: "Bawa KTP & KK ke ketua RT & RW", deadlineDays: 40 },
      { type: "Formulir N1, N2, N4 dari Kantor Kelurahan", note: "Surat pengantar nikah dari kelurahan", deadlineDays: 30 },
      { type: "Sertifikat Elsimil & MCU Puskesmas", note: "Skrining HB, TT, dan edukasi stunting", deadlineDays: 30 },
    ];

    if (isIslam) {
      defaultList.push(
        { type: "Surat Rekomendasi Nikah (bila beda kecamatan)", note: "Diambil dari KUA asal domisili", deadlineDays: 20 },
        { type: "Pendaftaran SIMKAH Online Kemenag", note: "Daftar simkah4.kemenag.go.id (max H-10 hari kerja)", deadlineDays: 14 },
        { type: "Sertifikat Bimwin (Bimbingan Perkawinan)", note: "Kursus calon pengantin KUA", deadlineDays: 14 }
      );
    } else {
      defaultList.push(
        { type: "Surat Izin / Baptis / Pemberkatan Pemuka Agama", note: "Dari pihak gereja / tempat ibadah", deadlineDays: 30 },
        { type: "Kursus Pranikah / Komisi Kerasulan Keluarga", note: "Sertifikat konseling pranikah", deadlineDays: 20 },
        { type: "Pendaftaran Pencatatan Sipil (Disdukcapil)", note: "Akta perkawinan catatan sipil", deadlineDays: 14 }
      );
    }

    await prisma.document.createMany({
      data: defaultList.map((d) => ({
        weddingPlanId: weddingPlan.id,
        type: d.type,
        status: "pending",
        note: d.note,
        deadlineDays: d.deadlineDays,
      })),
    });

    const documents = await prisma.document.findMany({
      where: { weddingPlanId: weddingPlan.id },
    });
    return NextResponse.json({ documents }, { status: 201 });
  }

  const { type, note, status, deadlineDays } = json;
  if (!type) {
    return NextResponse.json({ error: "Nama dokumen wajib diisi" }, { status: 400 });
  }

  const document = await prisma.document.create({
    data: {
      weddingPlanId: weddingPlan.id,
      type,
      note: note || null,
      status: status || "pending",
      deadlineDays: deadlineDays ? Number(deadlineDays) : 30,
    },
  });

  return NextResponse.json({ document }, { status: 201 });
}

export async function PATCH(request: Request) {
  const { weddingPlan, currentUserName } = await getCurrentWeddingPlan();
  if (!weddingPlan) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json();
  const { id, status, note, fileUrl } = json;

  if (!id) {
    return NextResponse.json({ error: "ID dokumen diperlukan" }, { status: 400 });
  }

  const updateData: any = {};
  if (status !== undefined) updateData.status = status;
  if (note !== undefined) updateData.note = note;
  if (fileUrl !== undefined) updateData.fileUrl = fileUrl;
  updateData.updatedBy = currentUserName;

  const document = await prisma.document.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json({ document });
}

export async function DELETE(request: Request) {
  const { weddingPlan } = await getCurrentWeddingPlan();
  if (!weddingPlan) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID dokumen diperlukan" }, { status: 400 });
  }

  await prisma.document.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
