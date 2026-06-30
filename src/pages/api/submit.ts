import type { APIRoute } from 'astro';
import sql from '../../utils/db';
import 'dotenv/config'; 
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client. Use Service Role key if available to bypass RLS.
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || ''
);

// Helper to save uploaded files to Supabase Storage
const saveFile = async (file: File, folderName: string) => {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  // Supabase Storage keys do not like spaces or special characters
  const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  const filePath = `${folderName}/${sanitizedFileName}`;
  
  const { data, error } = await supabase.storage
    .from('uploads')
    .upload(filePath, buffer, {
      contentType: file.type || 'application/octet-stream',
      upsert: true
    });

  if (error) {
    throw new Error(`Supabase upload error: ${error.message}`);
  }
  
  // Get the public URL for the uploaded file
  const { data: publicUrlData } = supabase.storage
    .from('uploads')
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();

    // Extract text fields
    const userId = formData.get('user_id') as string;
    const email = formData.get('email') as string;
    const requestType = formData.get('requestType') as string;
    const mName = formData.get('requestedByName') as string;
    const nNo = formData.get('requestedByMobile') as string;
    const aName = formData.get('alternateContactName') as string;
    const aNo = formData.get('alternateContactMobile') as string;
    const socMed = formData.get('socialAccount') as string;
    const service = formData.get('serviceType') as string;
    const eventDetails = formData.get('eventDetails') as string;
    const office_name = formData.get('office_name') as string || 'UnknownOffice';

    // Sanitize office name and create timestamp for folder safety
    const safeOfficeName = office_name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const folderName = `${safeOfficeName}_${timestamp}`;

    // Path outside user-dashboard - No longer needed, we'll pass folderName to Google Drive
    // const uploadDir = path.join(process.cwd(), '..', 'uploads', folderName);

    let ppTemplate = null;
    let image = null;
    let video = null;
    let audio = null;

    const files = formData.getAll('files') as File[];

    for (const file of files) {
      if (file.size === 0) continue; // Skip empty file entries
      const savedPath = await saveFile(file, folderName);
      if (file.name.endsWith('.docx') || file.name.endsWith('.pdf')) ppTemplate = savedPath;
      else if (file.type.startsWith('image/')) image = savedPath;
      else if (file.type.startsWith('video/')) video = savedPath;
      else if (file.type.startsWith('audio/')) audio = savedPath;
    }

    // Insert into Postgres
    await sql`
      INSERT INTO submissions (
        email, 
        request_type, 
        "mName", 
        "nNo", 
        "aName", 
        "aNo", 
        "socMed", 
        service, 
        "eventDetails", 
        office_name, 
        "ppTemplate", 
        image, 
        video, 
        audio, 
        user_id
      ) 
      VALUES (
        ${email}, 
        ${requestType}, 
        ${mName}, 
        ${nNo}, 
        ${aName}, 
        ${aNo}, 
        ${socMed}, 
        ${service}, 
        ${eventDetails}, 
        ${office_name}, 
        ${ppTemplate}, 
        ${image}, 
        ${video}, 
        ${audio}, 
        ${userId ? parseInt(userId) : null}
      )
    `;

    return new Response(JSON.stringify({ message: 'Success' }), {
      status: 200,
      headers: { 'content-type': 'application/json' }
    });
  } catch (error) {
    console.error('Submission error:', error);
    return new Response(JSON.stringify({ message: 'Error processing submission', error: error.message }), { status: 500 });
  }
};

