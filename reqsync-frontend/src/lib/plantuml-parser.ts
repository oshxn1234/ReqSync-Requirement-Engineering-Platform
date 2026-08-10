import type {
  UmlClass,
  UmlRelationship
} from '@/store/projectStore';

type WorkspaceDiagram = {
  classes: UmlClass[];
  relationships: UmlRelationship[];
};

function cleanMember(line: string): string {
  return line
    .replace(/^[+\-#~]\s*/, '')
    .replace(/\{[^}]+\}\s*$/, '')
    .trim();
}

function detectRelationshipType(
  line: string
): UmlRelationship['type'] | null {
  if (
    line.includes('<|--') ||
    line.includes('--|>')
  ) {
    return 'Inheritance';
  }

  if (
    line.includes('*--') ||
    line.includes('--*')
  ) {
    return 'Composition';
  }

  if (
    line.includes('o--') ||
    line.includes('--o')
  ) {
    return 'Aggregation';
  }

  if (
    line.includes('..>') ||
    line.includes('<..') ||
    line.includes('..|>')
  ) {
    return 'Dependency';
  }

  if (
    line.includes('--') ||
    line.includes('-->') ||
    line.includes('<--')
  ) {
    return 'Association';
  }

  return null;
}

export function parsePlantUmlToWorkspace(
  plantUmlCode: string
): WorkspaceDiagram {
  const classes: UmlClass[] = [];
  const relationships: UmlRelationship[] = [];

  if (!plantUmlCode?.trim()) {
    return {
      classes,
      relationships
    };
  }

  // Example:
  // class Account {
  //   - balance: BigDecimal
  //   + deposit(amount: BigDecimal): void
  // }
  const classRegex =
    /\bclass\s+(?:"([^"]+)"|([A-Za-z_][A-Za-z0-9_]*))\s*\{([\s\S]*?)\}/g;

  let match: RegExpExecArray | null;

  while (
    (match = classRegex.exec(plantUmlCode)) !== null
  ) {
    const className =
      (match[1] || match[2]).trim();

    const body = match[3];

    const attributes: string[] = [];
    const methods: string[] = [];

    body
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .forEach((line) => {
        const member = cleanMember(line);

        if (!member) {
          return;
        }

        if (
          member.includes('(') &&
          member.includes(')')
        ) {
          methods.push(member);
        } else {
          attributes.push(member);
        }
      });

    classes.push({
      id: `c${classes.length + 1}`,
      name: className,
      attributes,
      methods
    });
  }

  const plantUmlLines =
    plantUmlCode
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

  plantUmlLines.forEach((line) => {
    if (
      line.startsWith('@') ||
      line.startsWith('!') ||
      line.startsWith("'") ||
      line.startsWith('class ')
    ) {
      return;
    }

    const type =
      detectRelationshipType(line);

    if (!type) {
      return;
    }

    // Find class names appearing in the relationship line.
    const mentionedClasses =
      classes
        .map((umlClass) => ({
          umlClass,
          position: line.indexOf(umlClass.name)
        }))
        .filter((item) => item.position >= 0)
        .sort(
          (left, right) =>
            left.position - right.position
        );

    if (mentionedClasses.length < 2) {
      return;
    }

    const sourceClass =
      mentionedClasses[0].umlClass;

    const targetClass =
      mentionedClasses[1].umlClass;

    relationships.push({
      id: `r${relationships.length + 1}`,
      sourceClassId: sourceClass.id,
      targetClassId: targetClass.id,
      type
    });
  });

  return {
    classes,
    relationships
  };
}
