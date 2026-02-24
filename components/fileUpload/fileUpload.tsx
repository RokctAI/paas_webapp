import React, { useId } from "react";
import cls from "./fileUpload.module.scss";
import { useMutation } from "react-query";
import galleryService from "services/gallery";
import DeleteBinLineIcon from "remixicon-react/DeleteBinLineIcon";
import UploadCloud2LineIcon from "remixicon-react/UploadCloud2LineIcon";
import Loading from "components/loader/loading";
import { IconButton } from "@mui/material";

type Props = {
  label: string;
  error?: boolean;
  accept?: string;
  type: string;
  fileList: string[];
  setFileList: (files: string[]) => void;
};

export default function FileUpload({
  label,
  fileList,
  setFileList,
  error,
  accept,
  type,
}: Props) {
  const htmlId = useId();
  const { mutate: upload, isLoading: isUploading } = useMutation({
    mutationFn: (data: any) => galleryService.upload(data),
    onSuccess: (data) => {
      setFileList([...fileList, data?.data?.title]);
    },
  });

  const handleChange = (event: any) => {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append("image", file);
    formData.append("type", type);
    upload(formData);
  };

  const handleDelete = (idx: number) => {
    const newValues = fileList.filter((_, index) => index !== idx);
    setFileList(newValues);
  };

  return (
    <div>
      <label htmlFor={htmlId} className={cls.fileInput}>
        <div className={`${cls.uploadButton} ${error ? cls.error : ""}`}>
          <input
            hidden
            id={htmlId}
            type="file"
            accept={accept}
            onChange={handleChange}
          />
          <UploadCloud2LineIcon className={cls.icon} />
          <p className={cls.text}>{label}</p>
          {isUploading && <Loading />}
        </div>
      </label>
      {fileList.map((file, idx) => {
        const fileName = file.split("/").pop();
        return (
          <div key={file} className={cls.fileItem}>
            <a href={file} target="_blank" rel="noopener noreferrer">
              {fileName}
            </a>
            <IconButton onClick={() => handleDelete(idx)}>
              <DeleteBinLineIcon />
            </IconButton>
          </div>
        );
      })}
    </div>
  );
}
