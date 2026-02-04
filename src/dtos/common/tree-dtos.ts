import { t, type DtoConstructor, type SchemaNode } from "adorn-api";
import { registerDto, type FieldMeta } from "adorn-api/dist/core/metadata";

export interface TreeDtoClassNames {
  node: string;
  nodeResult: string;
  threadedNode: string;
  treeListEntry: string;
}

export interface TreeDtoOptions {
  names?: Partial<TreeDtoClassNames>;
  includeTreeMetadata?: boolean;
  parentSchema?: SchemaNode;
  keySchema?: SchemaNode;
  valueSchema?: SchemaNode;
}

export interface TreeDtoClasses {
  node: DtoConstructor;
  nodeResult: DtoConstructor;
  threadedNode: DtoConstructor;
  treeListEntry: DtoConstructor;
  treeListSchema: SchemaNode;
  threadedTreeSchema: SchemaNode;
}

export function createTreeDtoClasses(
  baseName: string,
  entityDto: DtoConstructor,
  options: TreeDtoOptions = {}
): TreeDtoClasses {
  const names = resolveNames(baseName, options.names);
  const includeTreeMetadata = options.includeTreeMetadata ?? true;

  const nodeDto = createTreeNodeDtoClass(entityDto, {
    name: names.node,
    includeTreeMetadata
  });

  const parentSchema = options.parentSchema ?? t.nullable(t.integer());
  const nodeResultDto = createTreeNodeResultDtoClass(entityDto, {
    name: names.nodeResult,
    includeTreeMetadata,
    parentSchema
  });

  const threadedNodeDto = createThreadedNodeDtoClass(entityDto, {
    name: names.threadedNode
  });

  const keySchema = options.keySchema ?? t.integer();
  const valueSchema = options.valueSchema ?? t.string();

  const treeListEntryDto = createTreeListEntryDtoClass({
    name: names.treeListEntry,
    keySchema,
    valueSchema
  });

  const treeListSchema = t.array(t.ref(treeListEntryDto), {
    description: `Flat list of ${baseName} tree entries for dropdown/select`
  });

  const threadedTreeSchema = t.array(t.ref(threadedNodeDto), {
    description: `Threaded tree structure of ${baseName} nodes`
  });

  return {
    node: nodeDto,
    nodeResult: nodeResultDto,
    threadedNode: threadedNodeDto,
    treeListEntry: treeListEntryDto,
    treeListSchema,
    threadedTreeSchema
  };
}

function createTreeNodeDtoClass(
  entityDto: DtoConstructor,
  options: { name: string; includeTreeMetadata: boolean }
): DtoConstructor {
  const TreeNodeDto = class {};
  Object.defineProperty(TreeNodeDto, "name", { value: options.name, configurable: true });

  const fields: Record<string, FieldMeta> = {
    entity: { schema: t.ref(entityDto) },
    lft: { schema: t.integer(), description: "Left boundary value (nested set)" },
    rght: { schema: t.integer(), description: "Right boundary value (nested set)" },
    isLeaf: { schema: t.boolean(), description: "Whether this node has no children" },
    isRoot: { schema: t.boolean(), description: "Whether this node has no parent" },
    childCount: { schema: t.integer({ minimum: 0 }), description: "Number of descendants" }
  };

  if (options.includeTreeMetadata) {
    fields.depth = {
      schema: t.integer({ minimum: 0 }),
      optional: true,
      description: "Depth level (0 = root)"
    };
  }

  registerDto(TreeNodeDto, {
    name: options.name,
    description: "A tree node with nested set boundaries and metadata",
    fields
  });

  return TreeNodeDto as DtoConstructor;
}

function createTreeNodeResultDtoClass(
  entityDto: DtoConstructor,
  options: {
    name: string;
    includeTreeMetadata: boolean;
    parentSchema: SchemaNode;
  }
): DtoConstructor {
  const TreeNodeResultDto = class {};
  Object.defineProperty(TreeNodeResultDto, "name", { value: options.name, configurable: true });

  const fields: Record<string, FieldMeta> = {
    data: { schema: t.ref(entityDto) },
    lft: { schema: t.integer(), description: "Left boundary value (nested set)" },
    rght: { schema: t.integer(), description: "Right boundary value (nested set)" },
    parentId: { schema: options.parentSchema, description: "Parent identifier (null for roots)" },
    isLeaf: { schema: t.boolean(), description: "Whether this node has no children" },
    isRoot: { schema: t.boolean(), description: "Whether this node has no parent" },
    childCount: { schema: t.integer({ minimum: 0 }), description: "Number of descendants" }
  };

  if (options.includeTreeMetadata) {
    fields.depth = {
      schema: t.integer({ minimum: 0 }),
      optional: true,
      description: "Depth level (0 = root)"
    };
  }

  registerDto(TreeNodeResultDto, {
    name: options.name,
    description: "A tree node result with nested set boundaries and metadata",
    fields
  });

  return TreeNodeResultDto as DtoConstructor;
}

function createThreadedNodeDtoClass(
  entityDto: DtoConstructor,
  options: { name: string }
): DtoConstructor {
  const ThreadedNodeDto = class {};
  Object.defineProperty(ThreadedNodeDto, "name", { value: options.name, configurable: true });

  registerDto(ThreadedNodeDto, {
    name: options.name,
    description: "A node in a threaded tree structure with nested children",
    fields: {
      node: { schema: t.ref(entityDto) },
      children: {
        schema: t.array(t.ref(ThreadedNodeDto as DtoConstructor)),
        description: "Child nodes in the tree hierarchy"
      }
    }
  });

  return ThreadedNodeDto as DtoConstructor;
}

function createTreeListEntryDtoClass(options: {
  name: string;
  keySchema: SchemaNode;
  valueSchema: SchemaNode;
}): DtoConstructor {
  const TreeListEntryDto = class {};
  Object.defineProperty(TreeListEntryDto, "name", { value: options.name, configurable: true });

  registerDto(TreeListEntryDto, {
    name: options.name,
    description: "A tree list entry for dropdown/select rendering",
    fields: {
      key: { schema: options.keySchema, description: "The key (usually primary key)" },
      value: { schema: options.valueSchema, description: "The display value with depth prefix" },
      depth: { schema: t.integer({ minimum: 0 }), description: "The depth level" }
    }
  });

  return TreeListEntryDto as DtoConstructor;
}

function resolveNames(
  baseName: string,
  names?: Partial<TreeDtoClassNames>
): Required<TreeDtoClassNames> {
  return {
    node: names?.node ?? `${baseName}NodeDto`,
    nodeResult: names?.nodeResult ?? `${baseName}NodeResultDto`,
    threadedNode: names?.threadedNode ?? `${baseName}ThreadedNodeDto`,
    treeListEntry: names?.treeListEntry ?? `${baseName}TreeListEntryDto`
  };
}
