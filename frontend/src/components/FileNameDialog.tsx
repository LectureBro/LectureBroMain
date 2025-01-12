import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface FileNameDialogProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSave: (fileName: string) => void;
  readonly defaultFileName: string;
}

export function FileNameDialog({ isOpen, onClose, onSave, defaultFileName }: FileNameDialogProps) {
  const [fileName, setFileName] = useState(defaultFileName);

  const handleSave = () => {
    onSave(fileName);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent aria-description="Save file Dialog">
        <DialogHeader>
          <DialogTitle>Save File</DialogTitle>
        </DialogHeader>
        <Input value={fileName} onChange={(e) => setFileName(e.target.value)} placeholder="Enter file name" />
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
