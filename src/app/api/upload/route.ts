import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Allowed upload types
type UploadType = 'production_report' | 'lab_report';

// Response shape
interface UploadResponse {
  success: boolean;
  filePath?: string;
  originalName?: string;
  size?: number;
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<UploadResponse>> {
  try {
    const formData = await request.formData();
    
    const uploadTypeEntry = formData.get('uploadType');
    const uploadType = typeof uploadTypeEntry === 'string' ? uploadTypeEntry : null;
    
    // Fix: Look for both 'file' and specific upload type fields
    const file = (formData.get('file') || 
                  formData.get('labReport') || 
                  formData.get('productionReport')) as File | null;
    
    // Validate presence
    if (!uploadType || !file) {
      return NextResponse.json(
        { success: false, error: 'Missing file or upload type' },
        { status: 400 }
      );
    }
    
    // Validate upload type
    if (!['production_report', 'lab_report'].includes(uploadType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid upload type' },
        { status: 400 }
      );
    }
    
    // Fix: Check if file is actually a File object
    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file object' },
        { status: 400 }
      );
    }
    
    // Validate file extension
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
    const fileExtension = path.extname(file.name).toLowerCase();
    
    if (!allowedExtensions.includes(fileExtension)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid file type. Only PDF, DOC, DOCX, JPG, JPEG, PNG files are allowed.'
        },
        { status: 400 }
      );
    }
    
    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }
    
    // Create upload directory
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', uploadType);
    
    // Fix: Add error handling for directory creation
    try {
      await fs.mkdir(uploadDir, { recursive: true });
    } catch (dirError) {
      console.error('Error creating directory:', dirError);
      return NextResponse.json(
        { success: false, error: 'Failed to create upload directory' },
        { status: 500 }
      );
    }
    
    // Create unique file name and path
    const fileName = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(uploadDir, fileName);
    
    // Fix: Add error handling for file operations
    try {
      // Save file to disk
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      await fs.writeFile(filePath, buffer);
      
      // Verify file was written
      const stats = await fs.stat(filePath);
      if (stats.size === 0) {
        throw new Error('File was not written properly');
      }
      
    } catch (fileError) {
      console.error('Error saving file:', fileError);
      return NextResponse.json(
        { success: false, error: 'Failed to save file to disk' },
        { status: 500 }
      );
    }
    
    // Return success response with relative file path
    const relativePath = `/uploads/${uploadType}/${fileName}`;
    return NextResponse.json({
      success: true,
      filePath: relativePath,
      originalName: file.name,
      size: file.size
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}