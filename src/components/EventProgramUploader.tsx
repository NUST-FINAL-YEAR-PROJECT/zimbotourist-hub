
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { FileText, Upload, File } from "lucide-react"; 
import { useUpdateEventProgram } from "@/hooks/useEvents";

interface EventProgramUploaderProps {
  eventId: string;
  onUploadComplete?: (url: string, fileName: string, fileType: string) => void;
  existingProgramUrl?: string | null;
  existingProgramName?: string | null;
  existingProgramType?: string | null;
}

export const EventProgramUploader = ({
  eventId,
  onUploadComplete,
  existingProgramUrl,
  existingProgramName,
  existingProgramType,
}: EventProgramUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const updateEventProgram = useUpdateEventProgram();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    const file = e.target.files[0];
    const fileExt = file.name.split(".").pop();
    const fileName = `${eventId}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${fileName}`;
    
    // Check file type
    const allowedTypes = ["pdf", "doc", "docx", "ppt", "pptx", "txt"];
    const fileType = fileExt?.toLowerCase();
    
    if (fileType && !allowedTypes.includes(fileType)) {
      toast.error("File type not supported. Please upload PDF, Word, PowerPoint, or text files.");
      return;
    }
    
    setUploading(true);
    setProgress(0);
    
    try {
      // Create a custom upload function that tracks progress
      const uploadFile = async () => {
        let uploadProgress = 0;
        
        // Set up progress tracking with XMLHttpRequest
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            uploadProgress = Math.round((event.loaded / event.total) * 100);
            setProgress(uploadProgress);
          }
        });
        
        // Use the standard Supabase upload without the onUploadProgress option
        const { error: uploadError, data } = await supabase.storage
          .from("events")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false
          });
          
        if (uploadError) {
          throw uploadError;
        }
        
        return data;
      };
      
      await uploadFile();
      
      const { data: { publicUrl } } = supabase.storage
        .from("events")
        .getPublicUrl(filePath);

      // Update the event with the program info
      await updateEventProgram.mutateAsync({
        eventId,
        programUrl: publicUrl,
        programName: file.name,
        programType: file.type,
      });

      toast.success("Program uploaded successfully!");
      
      // Call the callback if provided
      if (onUploadComplete) {
        onUploadComplete(publicUrl, file.name, file.type);
      }
    } catch (error: any) {
      toast.error("Error uploading file: " + error.message);
      console.error("Error uploading file:", error);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="my-4 border rounded-lg p-4">
      <h3 className="text-lg font-medium mb-2">Event Program</h3>
      {existingProgramUrl ? (
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="flex items-center">
            {existingProgramType?.includes("pdf") ? (
              <FileText className="h-5 w-5 mr-2 text-red-500" />
            ) : existingProgramType?.includes("word") || existingProgramType?.includes("doc") ? (
              <FileText className="h-5 w-5 mr-2 text-blue-500" />
            ) : existingProgramType?.includes("powerpoint") || existingProgramType?.includes("presentation") ? (
              <FileText className="h-5 w-5 mr-2 text-orange-500" />
            ) : (
              <File className="h-5 w-5 mr-2" />
            )}
            <span className="text-sm font-medium truncate max-w-[200px]">
              {existingProgramName || "Event Program"}
            </span>
          </div>
          <div className="flex gap-2">
            <Button asChild size="sm" variant="outline">
              <a href={existingProgramUrl} target="_blank" rel="noopener noreferrer">
                View
              </a>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <label htmlFor="program-upload" className="cursor-pointer">
                Replace
                <input
                  id="program-upload"
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
              </label>
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-sm text-gray-500 mb-2">
            Upload event program or schedule (PDF, Word, PowerPoint, or text files)
          </p>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" disabled={uploading}>
              <label htmlFor="program-upload" className="cursor-pointer flex items-center">
                <Upload className="h-4 w-4 mr-2" />
                Upload Program
                <input
                  id="program-upload"
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
              </label>
            </Button>
          </div>
        </div>
      )}
      
      {uploading && (
        <div className="mt-2">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-gray-500 mt-1">Uploading: {progress}%</p>
        </div>
      )}
    </div>
  );
};
