
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { 
  FileUp, 
  FileText, 
  FilePdf, 
  FileImage, 
  FileSpreadsheet,
  X,
  Download,
  Loader2 
} from "lucide-react";
import { Event } from "@/types/models";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface EventProgramUploaderProps {
  event: Event;
  onUploadSuccess?: (newProgramUrl: string) => void;
  isAdmin?: boolean;
}

export const EventProgramUploader = ({ 
  event, 
  onUploadSuccess,
  isAdmin = false 
}: EventProgramUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { id } = useParams();
  const queryClient = useQueryClient();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const uploadProgram = async () => {
    if (!selectedFile || !id) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('eventId', id);

      const { data, error } = await supabase.functions.invoke("upload-event-program", {
        body: formData,
      });

      if (error) {
        throw new Error(error.message || "Failed to upload program");
      }

      toast.success("Event program uploaded successfully");
      
      // Invalidate event query to refresh data
      queryClient.invalidateQueries({ queryKey: ["event", id] });
      
      if (onUploadSuccess) {
        onUploadSuccess(data.program_url);
      }
      
      setSelectedFile(null);
    } catch (error) {
      console.error("Error uploading program:", error);
      toast.error("Failed to upload program");
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = (fileType: string | null) => {
    if (!fileType) return <FileText className="h-10 w-10 text-blue-500" />;
    
    if (fileType.includes('pdf')) {
      return <FilePdf className="h-10 w-10 text-red-500" />;
    } else if (fileType.includes('image')) {
      return <FileImage className="h-10 w-10 text-green-500" />;
    } else if (fileType.includes('spreadsheet') || fileType.includes('excel') || fileType.includes('csv')) {
      return <FileSpreadsheet className="h-10 w-10 text-emerald-500" />;
    } else {
      return <FileText className="h-10 w-10 text-blue-500" />;
    }
  };

  // If the event has no program and the user isn't an admin, don't show anything
  if (!event.program_url && !isAdmin) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold flex items-center">
        <FileText className="w-5 h-5 mr-2 text-blue-500" />
        Event Program
      </h2>

      {isAdmin && (
        <Card className="border border-dashed border-gray-300 bg-gray-50 dark:bg-gray-900 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex flex-col items-center justify-center space-y-4 p-4">
              {selectedFile ? (
                <div className="flex items-center space-x-2">
                  <FileText className="h-6 w-6 text-blue-500" />
                  <span className="text-sm font-medium">{selectedFile.name}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6" 
                    onClick={() => setSelectedFile(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <FileUp className="h-10 w-10 text-gray-400" />
                  <div className="text-center">
                    <p className="text-sm font-medium">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-500">
                      PDF, DOCX, PPTX, XLSX, JPG, PNG (max 10MB)
                    </p>
                  </div>
                </>
              )}
              
              <Input 
                type="file" 
                className={`cursor-pointer opacity-0 absolute inset-0 ${selectedFile ? 'hidden' : ''}`}
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png"
              />
              
              {selectedFile && (
                <Button 
                  onClick={uploadProgram} 
                  className="w-full"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <FileUp className="h-4 w-4 mr-2" />
                      Upload Program
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {event.program_url && (
        <Card className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {getFileIcon(event.program_type)}
                
                <div>
                  <h3 className="font-medium">{event.program_name || "Event Program"}</h3>
                  <p className="text-sm text-gray-500">
                    {event.program_type?.split('/').pop()?.toUpperCase() || "Document"}
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-2">
                {event.program_type?.includes('pdf') || event.program_type?.includes('image') ? (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh]">
                      <DialogHeader>
                        <DialogTitle>{event.program_name || "Event Program"}</DialogTitle>
                      </DialogHeader>
                      <div className="mt-4 h-[60vh] overflow-auto">
                        {event.program_type?.includes('pdf') ? (
                          <iframe 
                            src={`${event.program_url}#view=FitH`}
                            className="w-full h-full"
                            title="Event Program"
                          />
                        ) : (
                          <img 
                            src={event.program_url} 
                            alt="Event Program"
                            className="max-w-full h-auto mx-auto"
                          />
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                ) : null}
                
                <Button variant="default" size="sm" asChild>
                  <a href={event.program_url} target="_blank" rel="noopener noreferrer" download>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
