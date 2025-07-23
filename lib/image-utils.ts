import type React from "react"
import { toast } from "@/hooks/use-toast"

export const handleFileChange = async (
  e: React.ChangeEvent<HTMLInputElement>,
  setFormData: React.Dispatch<React.SetStateAction<any>>,
  isDebugging = false
) => {
  const files = Array.from(e.target.files || [])
  const imageFiles = files.filter((file) => file.type.startsWith("image/"))

  if (imageFiles.length !== files.length) {
    toast({
      title: "Invalid files",
      description: "Only image files are allowed.",
      variant: "destructive",
    })
    return
  }

  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }

  try {
    const base64Images = await Promise.all(imageFiles.map(fileToDataUrl))
    const fileNames = imageFiles.map((file) => file.name)

    if (isDebugging) {
      base64Images.forEach((base64, index) => {
        console.log(`File: ${fileNames[index]}`)
        console.log(`Base64: ${base64}`)
      })
    }

    setFormData((prev: any) => ({
      ...prev,
      screenshots: [...prev.screenshots, ...base64Images],
      screenshotFileNames: [...prev.screenshotFileNames, ...fileNames],
    }))
  } catch (error) {
    console.error("Error converting files to Base64:", error)
    toast({
      title: "Error processing files",
      description: "Could not read the selected image files.",
      variant: "destructive",
    })
  }
}
