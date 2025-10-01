import React, { useState } from "react";
import CommonModal from "../../../../../../packages/ui/src/component/CommonModal/CommonModal";
import { Button } from "@nextforge/ui";

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckIn: (message: string, photo?: File) => Promise<void>;
  locationName: string;
}

const CheckInModal: React.FC<CheckInModalProps> = ({
  isOpen,
  onClose,
  onCheckIn,
  locationName,
}) => {
  const [message, setMessage] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [liked, setLiked] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    try {
      await onCheckIn(message, photo || undefined);
      setMessage("");
      setPhoto(null);
      setPreviewUrl(null);
      setLiked(false);
      onClose();
    } catch (error) {
      console.error("Check-in failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhoto(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  return (
    <CommonModal isOpen={isOpen} onClose={onClose} size="md" showCloseButton={false}>
      <div>
        <div className="flex items-center justify-between border-b mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Check In</h3>
            <p className="text-sm text-gray-700 mb-4">{locationName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-2">
          {!previewUrl ? (
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-8 text-gray-500 cursor-pointer hover:bg-gray-50">
              <span className="text-sm">Add an Image</span>
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handlePhotoChange}
              />
            </label>
          ) : (
            <div>
              <img
                src={previewUrl}
                alt="Uploaded Preview"
                className="w-40 h-28 rounded-md object-cover"
              />
              <label className="block mt-1 text-xs text-blue-600 cursor-pointer">
                Change Image
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handlePhotoChange}
                />
              </label>
            </div>
          )}

          <textarea
            rows={4}
            placeholder="Share your experience ..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />

          <label className="flex items-start space-x-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={liked}
              onChange={(e) => setLiked(e.target.checked)}
              className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <span>
              <span className="font-medium">I like the experience</span>
              <br />
              <span className="text-xs text-gray-500">
                If you enjoyed your experience, let other users know. Click the
                Thumbs Up button.
              </span>
            </span>
          </label>

          <Button
            type="submit"
            disabled={!message.trim() || isSubmitting}
            isLoading={isSubmitting}
            className="w-full bg-[#F97316] hover:bg-[#ea580c] text-white rounded-md py-2"
          >
            Check In
          </Button>
        </form>
      </div>
    </CommonModal>
  );
};

export default CheckInModal;
