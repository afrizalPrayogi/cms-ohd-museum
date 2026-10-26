import { Step } from "app/types";
import { z, ZodSchema, ZodTypeAny } from "zod";


export function renameKeys<T extends Record<string, any>>(
  obj: T,
  keyMap: Record<string, string>
): Record<string, any> {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    const newKey = keyMap[key] ?? key;
    acc[newKey] = value;
    return acc;
  }, {} as Record<string, any>);
}

export function generateZodSchema(sections: Step[]) {
  const shape: Record<string, z.ZodTypeAny> = {};

  // console.log('sections: ', sections);
  sections.forEach((section) => {
    // console.log('sections: ', section);
    section.fields.forEach((field) => {
      let zodType: z.ZodTypeAny;
      // console.log(`${section.title} field: `, field);
      switch (field.type) {
        case "text":
          zodType = z.union([z.string(), z.number(), z.null()]).optional(); // default optional
          if (field.required) {
            zodType = zodType.refine(
              (val) =>
                val === undefined ||
                val === null ||
                (typeof val === "string" && val.trim() !== "") ||
                (typeof val === "number" && !isNaN(val)),
              { message: `${section.title} ${field.label} is required` }
            );
          }
          break;

        case "switch":
          zodType = z.union([z.boolean(), z.null()]).optional();
          if (field.required) {
            zodType = zodType.refine(
              (val) => val === undefined || val === null || typeof val === "boolean",
              { message: `${section.title} ${field.label} must be boolean` }
            );
          }
          break;

        case "hide":
          zodType = z.union([z.string(), z.number(), z.null()]).optional();
          break;

        default:
          zodType = z.any().optional();
          break;
      }
      console.log(
        "Generated schema for:",
        field.name,
        field.required ? "required" : "optional"
      );

      shape[field.name] = zodType;
    });
  });

  return z.object(shape);
}
export function validateWithZod(schema: ZodTypeAny, data: any) {
  console.log("🚀 schema:", schema);
  console.log("🚀 Input Data Type:", typeof data, Array.isArray(data));
  console.log("🚀 Input Data:", JSON.stringify(data, null, 2));

  // ✅ Kalau data array → validasi item satu per satu
  if (Array.isArray(data)) {
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      const parsedResult = schema.safeParse(item);

      if (!parsedResult.success) {
        console.error(`❌ Validation failed (index ${i}):`);
        parsedResult.error.issues.forEach((issue) => {
          console.error(`  [${issue.path.join(".")}] ${issue.message}`);
        });
        const messages = parsedResult.error.issues
          .map((issue) => issue.message)
          .join(", ");
        return { success: false, error: messages, index: i };
      }
    }
    return { success: true, data }; // semua lolos
  }

  // ✅ Kalau bukan array → validasi normal
  const parsedResult = schema.safeParse(data);
  if (!parsedResult.success) {
    console.error("❌ Validation failed:");
    parsedResult.error.issues.forEach((issue) => {
      console.error(`  [${issue.path.join(".")}] ${issue.message}`);
    });
    const messages = parsedResult.error.issues
      .map((issue) => issue.message)
      .join(", ");
    return { success: false, error: messages };
  }

  return { success: true, data: parsedResult.data };
}
