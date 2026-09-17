import { inputClass, textareaClass } from "./ui";
import type { AnswerValue, FieldType } from "@/lib/intake/types";

/**
 * One answer control, shared by the Account Manager's editor, the preview and
 * the client questionnaire.
 *
 * Sharing it is the point: the preview is only trustworthy if it is rendering
 * the same component the client will get, rather than an approximation of it.
 */
export function AnswerInput({
  name,
  fieldType,
  options,
  value,
  disabled,
  id,
}: {
  name: string;
  fieldType: FieldType;
  options: string[];
  value: AnswerValue;
  disabled?: boolean;
  id?: string;
}) {
  const asString = typeof value === "string" ? value : "";
  const asList = Array.isArray(value) ? value : [];

  if (fieldType === "multiselect") {
    return (
      <fieldset disabled={disabled} className="grid gap-2 @md:grid-cols-2">
        {/*
         * Unchecked boxes send nothing, so a client who clears every option
         * would post no key at all and the old answer would survive. This
         * keeps the field present in the payload; the empty string is not one
         * of the offered options, so normalizeAnswer discards it.
         */}
        <input type="hidden" name={name} value="" />
        {options.map((option) => (
          <label key={option} className="flex items-baseline gap-2.5 text-[0.9375rem] text-charcoal">
            <input
              type="checkbox"
              name={name}
              value={option}
              defaultChecked={asList.includes(option)}
              className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-teal-ink)]"
            />
            <span>{option}</span>
          </label>
        ))}
      </fieldset>
    );
  }

  if (fieldType === "select") {
    return (
      <select
        id={id}
        name={name}
        defaultValue={asString}
        disabled={disabled}
        className={inputClass}
      >
        <option value="">Not answered</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }

  if (fieldType === "boolean") {
    return (
      <label className="flex items-baseline gap-2.5 text-[0.9375rem] text-charcoal">
        <input
          id={id}
          type="checkbox"
          name={name}
          value="true"
          defaultChecked={value === true}
          disabled={disabled}
          className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-teal-ink)]"
        />
        <span>Yes</span>
      </label>
    );
  }

  if (fieldType === "text" || fieldType === "email" || fieldType === "url") {
    return (
      <input
        id={id}
        name={name}
        type={fieldType === "text" ? "text" : fieldType}
        defaultValue={asString}
        disabled={disabled}
        className={inputClass}
      />
    );
  }

  return (
    <textarea
      id={id}
      name={name}
      defaultValue={asString}
      disabled={disabled}
      rows={3}
      className={textareaClass}
    />
  );
}

/** A stored answer rendered as text, for review screens. */
export function AnswerText({ value }: { value: AnswerValue }) {
  if (value === null || value === undefined || value === "") {
    return <span className="text-muted">Not answered</span>;
  }
  if (Array.isArray(value)) {
    return value.length > 0 ? (
      <span>{value.join(", ")}</span>
    ) : (
      <span className="text-muted">Not answered</span>
    );
  }
  if (typeof value === "boolean") return <span>{value ? "Yes" : "No"}</span>;
  return <span className="whitespace-pre-wrap">{value}</span>;
}
