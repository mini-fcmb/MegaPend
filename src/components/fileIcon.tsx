// src/components/FileIcon.tsx
import React from "react";
import {
  AiFillFile,
  AiFillFilePdf,
  AiFillFileWord,
  AiFillFileExcel,
  AiFillFileImage,
} from "react-icons/ai";
import { FaFilePowerpoint, FaVideo } from "react-icons/fa";

const iconMap = {
  pdf: { icon: AiFillFilePdf, color: "#D32F2F" },
  word: { icon: AiFillFileWord, color: "#1E88E5" },
  document: { icon: AiFillFileWord, color: "#1E88E5" },
  excel: { icon: AiFillFileExcel, color: "#43A047" },
  spreadsheet: { icon: AiFillFileExcel, color: "#43A047" },
  presentation: { icon: FaFilePowerpoint, color: "#F57C00" },
  ppt: { icon: FaFilePowerpoint, color: "#F57C00" },
  image: { icon: AiFillFileImage, color: "#6A1B9A" },
  video: { icon: FaVideo, color: "#424242" },
};

interface FileIconProps {
  fileType: string;
  size?: number;
}

const FileIcon: React.FC<FileIconProps> = ({ fileType, size = 40 }) => {
  const lower = fileType.toLowerCase();
  const match = Object.keys(iconMap).find((key) => lower.includes(key));

  const { icon, color } = match
    ? iconMap[match as keyof typeof iconMap]
    : { icon: AiFillFile, color: "#757575" };

  // ✅ Explicitly cast to a valid React component type
  const IconComponent = icon as React.ComponentType<{
    size?: number;
    color?: string;
  }>;

  return <IconComponent size={size} color={color} />;
};

export default FileIcon;
