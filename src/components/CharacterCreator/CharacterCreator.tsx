"use client";

import React, { useEffect, ChangeEvent, useReducer, useState } from "react";
import cx from "classnames";
import "./characterCreator.css";
import { fetchData } from "@utils/fetchData";

import { useClasses } from "@context/ClassesContext";
import { useRaces } from "@/context/RacesContext";
import { useAbilityScores } from "@/context/AbilityScoreContext";
import { useSkills } from "@/context/SkillsContext";

import { CharacterCheckboxField } from "@components/CharacterCreator/CharacterCheckboxField";
import { TextField } from "@components/TextField/TextField";
import { SelectField } from "@components/SelectField/SelectField";
import { StatInput } from "@components/StatInput/StatInput";

const skills = [
  {
    id: "acrobatics",
    value: "acrobatics",
    label: "Acrobatics",
    attribute: "dexterity",
    secondaryLabel: "(Dex)",
  },
  {
    id: "animal-handling",
    value: "animal-handling",
    label: "Animal Handling",
    attribute: "wisdom",
    secondaryLabel: "(Wis)",
  },
  {
    id: "arcana",
    value: "arcana",
    label: "Arcana",
    attribute: "intelligence",
    secondaryLabel: "(Int)",
  },
  {
    id: "athletics",
    value: "athletics",
    label: "Athletics",
    attribute: "strength",
    secondaryLabel: "(Str)",
  },
  {
    id: "deception",
    value: "deception",
    label: "Deception",
    attribute: "charisma",
    secondaryLabel: "(Cha)",
  },
  {
    id: "history",
    value: "history",
    label: "History",
    attribute: "intelligence",
    secondaryLabel: "(Int)",
  },
  {
    id: "insight",
    value: "insight",
    label: "Insight",
    attribute: "wisdom",
    secondaryLabel: "(Wis)",
  },
  {
    id: "intimidation",
    value: "intimidation",
    label: "Intimidation",
    attribute: "charisma",
    secondaryLabel: "(Cha)",
  },
  {
    id: "investigation",
    value: "investigation",
    label: "Investigation",
    attribute: "intelligence",
    secondaryLabel: "(Int)",
  },
  {
    id: "medicine",
    value: "medicine",
    label: "Medicine",
    attribute: "wisdom",
    secondaryLabel: "(Wis)",
  },
  {
    id: "nature",
    value: "nature",
    label: "Nature",
    attribute: "intelligence",
    secondaryLabel: "(Int)",
  },
  {
    id: "perception",
    value: "perception",
    label: "Perception",
    attribute: "wisdom",
    secondaryLabel: "(Wis)",
  },
  {
    id: "performance",
    value: "performance",
    label: "Performance",
    attribute: "charisma",
    secondaryLabel: "(Cha)",
  },
  {
    id: "persuasion",
    value: "persuasion",
    label: "Persuasion",
    attribute: "charisma",
    secondaryLabel: "(Cha)",
  },
  {
    id: "religion",
    value: "religion",
    label: "Religion",
    attribute: "intelligence",
    secondaryLabel: "(Int)",
  },
  {
    id: "sleight-of-hand",
    value: "sleight-of-hand",
    label: "Sleight of Hand",
    attribute: "dexterity",
    secondaryLabel: "(Dex)",
  },
  {
    id: "stealth",
    value: "stealth",
    label: "Stealth",
    attribute: "dexterity",
    secondaryLabel: "(Dex)",
  },
  {
    id: "survival",
    value: "survival",
    label: "Survival",
    attribute: "wisdom",
    secondaryLabel: "(Wis)",
  },
];

export interface CharacterClassesProps {
  value: string;
  label: string;
}

export interface CharacterRaceProps {
  name: string;
  url: string;
  value: string;
  label: string;
}

export interface CharacterCreatorProps {
  className?: string;
}

export interface CharacterStatsProps {
  [key: string]: {
    value: number;
    modifier: number;
  };
}

interface ProficiencyChoiceProps {
  choose: number;
  desc: string;
  from: {
    options: [
      item: {
        index: string;
        name: string;
        url: string;
      },
    ];
  };
}

export interface ClassDataProps {
  index: string;
  name: string;
  hit_die: number;
  proficiency_choices: ProficiencyChoiceProps[];
  proficiencies: {
    name: string;
    index: string;
    url: string;
  }[];
  saving_throws: {
    name: string;
    index: string;
    url: string;
  }[];
}

interface AttributeModifiersProps {
  attribute: string;
  skill: string;
  modifier: number;
  proficient: boolean;
  proficientBonus: number | undefined;
  raceBonus?: number;
}

const AttributeModifiers = ({
  skill,
  attribute,
  modifier,
  proficient = false,
  proficientBonus = 1,
  raceBonus = 0,
}: AttributeModifiersProps) => {
  let totalModifier = modifier + raceBonus;

  if (proficient) {
    totalModifier += proficientBonus;
  }

  return (
    <div>
      <strong>{skill}:</strong> {attribute} {totalModifier}{" "}
      {proficient && "proficient"}
    </div>
  );
};

interface CharacterState {
  characterOptions: CharacterClassesProps[];
  raceOptions: CharacterRaceProps[];
  name?: string;
  class?: string;
  race?: string;
  level?: number;
  proficiencyBonus?: number;
  checkedAttributes?: string[] | undefined;
  stats?: CharacterStatsProps | undefined;
  classData?: ClassDataProps | null;
  proficiencyChoices?: ProficiencyChoiceProps[] | null;
}

type CharacterAction =
  | { type: "SET_CHARACTER_OPTIONS"; payload: CharacterClassesProps[] }
  | { type: "SET_RACE_OPTIONS"; payload: CharacterRaceProps[] }
  | { type: "SET_CHARACTER_NAME"; payload: string }
  | { type: "SET_CHARACTER_CLASS"; payload: string }
  | { type: "SET_CHARACTER_RACE"; payload: string }
  | { type: "SET_CHARACTER_LEVEL"; payload: number }
  | { type: "SET_PROFICIENCY_BONUS"; payload: number }
  | { type: "SET_CHECKED_ATTRIBUTES"; payload: string[] }
  | { type: "SET_CHARACTER_STATS"; payload: CharacterStatsProps }
  | { type: "SET_CLASS_DATA"; payload: ClassDataProps }
  | { type: "SET_PROFICIENCY_CHOICES"; payload: ProficiencyChoiceProps[] };

function CharacterReducer(state: CharacterState, action: CharacterAction) {
  switch (action.type) {
    case "SET_CHARACTER_OPTIONS":
      return { ...state, characterOptions: action.payload };
    case "SET_RACE_OPTIONS":
      return { ...state, raceOptions: action.payload };
    case "SET_CHARACTER_NAME":
      return { ...state, name: action.payload };
    case "SET_CHARACTER_LEVEL":
      return { ...state, level: action.payload };
    case "SET_CHARACTER_CLASS":
      return { ...state, class: action.payload };
    case "SET_PROFICIENCY_BONUS": {
      let bonus = 2;
      if (action.payload <= 1) {
        bonus = 2;
      } else if (action.payload <= 5) {
        bonus = 3;
      } else if (action.payload <= 9) {
        bonus = 4;
      } else if (action.payload <= 13) {
        bonus = 5;
      } else if (action.payload <= 17) {
        bonus = 6;
      }
      return { ...state, proficiencyBonus: bonus };
    }
    case "SET_CHARACTER_RACE":
      return { ...state, race: action.payload };
    case "SET_CHECKED_ATTRIBUTES":
      return { ...state, checkedAttributes: action.payload };
    case "SET_CHARACTER_STATS":
      return { ...state, stats: action.payload };
    case "SET_CLASS_DATA":
      return { ...state, classData: action.payload };
    case "SET_PROFICIENCY_CHOICES":
      return { ...state, proficiencyChoices: action.payload };
  }
}

export const CharacterCreator = ({ className }: CharacterCreatorProps) => {
  const characterClasses = useClasses();
  const characterRaces = useRaces();
  const abilityScores = useAbilityScores();
  const characterSkills = useSkills();

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [state, dispatch] = useReducer(CharacterReducer, {
    characterOptions: [],
    raceOptions: [],
    name: "",
    race: "Dragonborn",
    class: "Barbarian",
    level: 1,
    proficiencyBonus: 2,
    checkedAttributes: [],
    stats: {
      strength: { value: 10, modifier: 0 },
      dexterity: { value: 10, modifier: 0 },
      constitution: { value: 10, modifier: 0 },
      intelligence: { value: 10, modifier: 0 },
      wisdom: { value: 10, modifier: 0 },
      charisma: { value: 10, modifier: 0 },
    },
    classData: null,
    proficiencyChoices: null,
  });

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const mappedData = characterClasses.classes.map(
          (item: any, index: number) => ({
            index,
            value: item.index,
            label: item.name,
          }),
        );
        dispatch({ type: "SET_CHARACTER_OPTIONS", payload: mappedData });
        if (mappedData.length > 0) {
          dispatch({
            type: "SET_CHARACTER_CLASS",
            payload: mappedData[0].label,
          });
        }
      } catch (error) {
        console.error("Failed to fetch classes:", error);
      }
    };

    fetchClasses();
  }, [characterClasses.classes]);

  useEffect(() => {
    const fetchRaces = async () => {
      try {
        const mappedData = characterRaces.races.map(
          (item: any, index: number) => ({
            index,
            url: item.url,
            name: item.name,
            value: item.index,
            label: item.name,
          }),
        );
        dispatch({ type: "SET_RACE_OPTIONS", payload: mappedData });
        if (mappedData.length > 0) {
          dispatch({
            type: "SET_CHARACTER_RACE",
            payload: mappedData[0].label,
          });
        }
      } catch (error) {
        console.error("Failed to fetch races:", error);
      }
    };

    fetchRaces();
  }, [characterRaces.races]);

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: "SET_CHARACTER_NAME", payload: event.target.value });
  };

  const handleLevelChange = (event: ChangeEvent<HTMLInputElement>) => {
    const level = parseInt(event.target.value);
    dispatch({ type: "SET_CHARACTER_LEVEL", payload: level });
    dispatch({ type: "SET_PROFICIENCY_BONUS", payload: level });
  };

  const handleClassChange = async (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const selectedValue = event.target.value;

    /**
     * Retrieves the label of the selected character class.
     * If the selected value matches a character class option, the corresponding label is returned.
     * If no match is found, an empty string is returned.
     */
    const selectedLabel =
      state.characterOptions.find((option) => option.value === selectedValue)
        ?.label || "";

    dispatch({ type: "SET_CHARACTER_CLASS", payload: selectedLabel });

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/classes/${selectedLabel.toLowerCase()}`);
      if (!res.ok) {
        throw new Error("Failed to fetch class data");
      }
      const data: ClassDataProps = await res.json();

      dispatch({ type: "SET_CLASS_DATA", payload: data });
      dispatch({
        type: "SET_PROFICIENCY_CHOICES",
        payload: data.proficiency_choices,
      });
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchClassData = async () => {
      try {
        const res = await fetch(`/api/classes/barbarian`);
        if (!res.ok) {
          throw new Error("Failed to fetch class data");
        }
        const data: ClassDataProps = await res.json();

        dispatch({ type: "SET_CLASS_DATA", payload: data });
        dispatch({
          type: "SET_PROFICIENCY_CHOICES",
          payload: data.proficiency_choices,
        });
      } catch (error) {
        setError((error as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchClassData();
  }, []); // Empty dependency array

  const handleRaceChange = async (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const selectedValue = event.target.value;

    /**
     * Retrieves the label of the selected character Race.
     * If the selected value matches a character Race option, the corresponding label is returned.
     * If no match is found, an empty string is returned.
     */
    const selectedLabel =
      state.raceOptions.find((option) => option.value === selectedValue)
        ?.label || "";

    dispatch({ type: "SET_CHARACTER_RACE", payload: selectedLabel });
  };

  /**
   * Handles the change event for the attributes checkboxes.
   * Updates the `checkedAttributes` state based on the checkbox selection.
   */
  const handleAttributesChange = (event: ChangeEvent<HTMLInputElement>) => {
    const attribute = event.target.value;
    const isChecked = event.target.checked;

    let updatedAttributes = [...(state.checkedAttributes ?? [])];

    if (isChecked) {
      // Add the attribute to the array if it doesn't exceed the limit
      if (updatedAttributes.length < 5) {
        updatedAttributes.push(attribute);
      }
    } else {
      // Remove the attribute from the array
      updatedAttributes = updatedAttributes.filter(
        (attr) => attr !== attribute,
      );
    }

    dispatch({ type: "SET_CHECKED_ATTRIBUTES", payload: updatedAttributes });
  };

  const handleStatChange = (event: ChangeEvent<HTMLInputElement>) => {
    let statModifier: number = 0;
    const statId = event.target.id;
    const statValue = parseInt(event.target.value);

    if (statValue >= 20) {
      statModifier = 5;
    } else if (statValue >= 18) {
      statModifier = 4;
    } else if (statValue >= 16) {
      statModifier = 3;
    } else if (statValue >= 14) {
      statModifier = 2;
    } else if (statValue >= 12) {
      statModifier = 1;
    } else if (statValue >= 10) {
      statModifier = 0;
    } else if (statValue >= 8) {
      statModifier = -1;
    } else if (statValue >= 6) {
      statModifier = -2;
    } else if (statValue >= 4) {
      statModifier = -3;
    } else if (statValue >= 2) {
      statModifier = -4;
    } else {
      statModifier = -5;
    }

    let updatedStats = { ...(state.stats ?? {}) };

    updatedStats[statId] = {
      value: statValue,
      modifier: statModifier,
    };

    dispatch({ type: "SET_CHARACTER_STATS", payload: updatedStats });
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const characterData = {
      name: state.name,
      race: state.race,
      level: state.level,
      class: state.class,
      attributes: state.checkedAttributes,
      stats: state.stats,
      proficiencyBonus: state.proficiencyBonus,
    };

    console.log(characterData);
  };

  const componentClassName = cx("character-creator", className);

  return (
    <div className={componentClassName}>
      <form onSubmit={handleFormSubmit}>
        <TextField
          label="Character Name"
          id="character-name"
          placeholder="Enter character name"
          onChange={handleNameChange}
        />
        <SelectField
          label="Character Class"
          id="character-class"
          options={state.characterOptions}
          value={state.class}
          onChange={handleClassChange}
        />
        <SelectField
          label="Character Race"
          id="character-Race"
          options={state.raceOptions}
          value={state.race}
          onChange={handleRaceChange}
        />
        <TextField
          label="Character Level"
          id="character-level"
          type="number"
          minNumber={1}
          maxNumber={20}
          defaultValue={1}
          value={state.level}
          onChange={handleLevelChange}
        />

        <div className="stats">
          {abilityScores.abilityScores.map((stat) => (
            <StatInput
              key={stat.index}
              label={stat.name}
              id={stat.index}
              defaultValue={10}
              onChange={handleStatChange}
            />
          ))}
        </div>
        <CharacterCheckboxField
          characterSkills={characterSkills}
          proficiencyChoices={state.proficiencyChoices}
          handleAttributesChange={handleAttributesChange}
        />

        <button type="submit" className="character-creator__submit">
          Create Character
        </button>
      </form>

      <div className="character-creator__display">
        <p>
          <strong>Name: </strong>
          {state.name}
        </p>
        <p>
          <strong>Race: </strong>
          {state.race}
        </p>
        <p>
          <strong>Level:</strong> {state.level}
        </p>
        <p>
          <strong>Proficiency Bonus:</strong> +{state.proficiencyBonus}
        </p>
        <p>
          <strong>Class:</strong>{" "}
          <span id="character-class-display">{state.class}</span>
        </p>
        <p>
          <span id="character-attributes-display">
            {state.checkedAttributes?.join(", ")}
          </span>
        </p>
        <div>
          <strong>Stats:</strong>
          <ul>
            {Object.entries(state.stats ?? {}).map(([stat, value]) => (
              <li key={stat}>
                <strong>{stat}:</strong> {value.value.toString()}, Mod{" "}
                {value.modifier.toString() > "0"
                  ? `+${value.modifier}`
                  : value.modifier}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div>
        <strong>Attributes:</strong>{" "}
        {skills.map((skill) => (
          <AttributeModifiers
            key={skill.id}
            skill={skill.label}
            attribute={skill.attribute}
            modifier={state.stats?.[skill.attribute]?.modifier ?? 0}
            proficient={
              state.checkedAttributes?.includes(skill.value) ? true : false
            }
            proficientBonus={state.proficiencyBonus}
          />
        ))}
      </div>
    </div>
  );
};

export default CharacterCreator;
