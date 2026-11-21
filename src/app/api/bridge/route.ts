import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/session';

export async function GET() {
  try {
    const { data: bridges, error: bridgeErr } = await supabase
      .from('sentimen_issue_bridges')
      .select('*')
      .eq('status', 'ACTIVE')
      .order('created_at', { ascending: false });

    if (bridgeErr) throw bridgeErr;

    const { data: verifs, error: verifErr } = await supabase
      .from('sentimen_dtd_verifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (verifErr) throw verifErr;

    return NextResponse.json({
      success: true,
      bridges: bridges || [],
      verifications: verifs || [],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();

    const {
      bridge_id,
      survey_id,
      voter_name,
      voter_address,
      is_aware_of_issue,
      accepted_clarification,
      voter_sentiment,
      voter_feedback,
      location_label,
    } = body;

    if (!bridge_id) {
      return NextResponse.json({ error: 'Bridge ID wajib disertakan.' }, { status: 400 });
    }

    const verifId = `verif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    const { data, error } = await supabase
      .from('sentimen_dtd_verifications')
      .insert({
        id: verifId,
        bridge_id,
        survey_id: survey_id || null,
        volunteer_id: user?.id || 'anonymous',
        volunteer_name: user?.name || 'Relawan Lapangan DTD',
        voter_name: voter_name || 'Warga (Responden DTD)',
        voter_address: voter_address || '',
        is_aware_of_issue: Boolean(is_aware_of_issue),
        accepted_clarification: Boolean(accepted_clarification),
        voter_sentiment: voter_sentiment || 'POSITIF',
        voter_feedback: voter_feedback || '',
        location_label: location_label || 'Wilayah Survei',
      })
      .select('*')
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Verifikasi opini lapangan pemilih berhasil dicatat ke Event Bridge!',
      verification: data,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
