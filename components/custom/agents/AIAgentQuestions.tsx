"use client";

import React, { useState } from "react";
import { ClarificationQuestion } from "./CreateAgent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HelpCircle, Check, ArrowRight } from "lucide-react";

type Props = {
  questionList: ClarificationQuestion[];
  onAnswersSubmit?: (answers: Record<string, string | string[]>) => void;
};

export default function AIAgentQuestions({ questionList, onAnswersSubmit }: Props) {
  // Store user selections indexed by question id
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string | string[]>>({});
  const [customInputs, setCustomInputs] = useState<Record<string, string>>({});

  // Toggle single_select option
  const handleSingleSelect = (questionId: string, option: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }));
  };

  // Toggle multi_select option
  const handleMultiSelect = (questionId: string, option: string) => {
    setSelectedAnswers((prev) => {
      const current = (prev[questionId] as string[]) || [];
      const updated = current.includes(option)
        ? current.filter((item) => item !== option)
        : [...current, option];
      return { ...prev, [questionId]: updated };
    });
  };

  // Handle custom input typing
  const handleCustomInputChange = (questionId: string, value: string) => {
    setCustomInputs((prev) => ({ ...prev, [questionId]: value }));
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = () => {
    if (onAnswersSubmit) {
      onAnswersSubmit(selectedAnswers);
    }
  };

  if (!questionList || questionList.length === 0) return null;

  return (
    <div className="mt-6 space-y-6">
      <div className="flex items-center gap-2 text-purple-600 font-medium text-sm">
        <HelpCircle className="w-4 h-4" />
        <span>Please answer a few quick questions to finalize your agent configuration</span>
      </div>

      <div className="space-y-4">
        {questionList.map((item, index) => {
          const selectedValue = selectedAnswers[item.id];

          return (
            <div
              key={item.id || index}
              className="p-5 rounded-2xl border bg-background shadow-sm hover:shadow-md transition-all duration-300"
            >
              <h3 className="font-semibold text-slate-900 text-sm md:text-base flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-600 text-xs font-bold">
                  {index + 1}
                </span>
                {item.question}
              </h3>

              {/* Render single_select options */}
              {item.type === "single_select" && item.options?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.options.map((option) => {
                    const isSelected = selectedValue === option;
                    return (
                      <Button
                        key={option}
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleSingleSelect(item.id, option)}
                        className={`rounded-xl transition-all ${
                          isSelected
                            ? "bg-purple-600 hover:bg-purple-700 text-white"
                            : "hover:border-purple-300"
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 mr-1" />}
                        {option}
                      </Button>
                    );
                  })}
                </div>
              )}

              {/* Render multi_select options */}
              {item.type === "multi_select" && item.options?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.options.map((option) => {
                    const selectedList = (selectedValue as string[]) || [];
                    const isSelected = selectedList.includes(option);
                    return (
                      <Button
                        key={option}
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleMultiSelect(item.id, option)}
                        className={`rounded-xl transition-all ${
                          isSelected
                            ? "bg-purple-600 hover:bg-purple-700 text-white"
                            : "hover:border-purple-300"
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 mr-1" />}
                        {option}
                      </Button>
                    );
                  })}
                </div>
              )}

              {/* Render Custom Input field if allowed or if type is text/number */}
              {(item.allowCustom || item.type === "text" || item.type === "number") && (
                <div className="mt-3">
                  <Input
                    type={item.type === "number" ? "number" : "text"}
                    placeholder={item.customPlaceholder || "Type your response here..."}
                    value={customInputs[item.id] || ""}
                    onChange={(e) => handleCustomInputChange(item.id, e.target.value)}
                    className="rounded-xl border-slate-200 focus:border-purple-500 focus:ring-purple-500 text-sm"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-end pt-2">
        <Button
          onClick={handleSubmit}
          className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white gap-2 shadow-md shadow-purple-200"
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}