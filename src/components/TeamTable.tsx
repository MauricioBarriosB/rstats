import { useMemo, useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  getKeyValue,
  Chip,
  User,
  Tooltip,
  Pagination,
} from "@heroui/react";

type StatusColor = "success" | "danger" | "warning";

const statusColorMap: Record<string, StatusColor> = {
  active: "success",
  paused: "danger",
  vacation: "warning",
};

const columns = [
  { key: "name", label: "Name" },
  { key: "role", label: "Role" },
  { key: "department", label: "Department" },
  { key: "status", label: "Status" },
  { key: "email", label: "Email" },
];

const users = [
  {
    key: "1",
    name: "Tony Reichert",
    role: "CEO",
    department: "Management",
    status: "active",
    email: "tony.reichert@example.com",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
  },
  {
    key: "2",
    name: "Zoey Lang",
    role: "Technical Lead",
    department: "Development",
    status: "paused",
    email: "zoey.lang@example.com",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
  },
  {
    key: "3",
    name: "Jane Fisher",
    role: "Senior Developer",
    department: "Development",
    status: "active",
    email: "jane.fisher@example.com",
    avatar: "https://i.pravatar.cc/150?u=a04258114e29026702d",
  },
  {
    key: "4",
    name: "William Howard",
    role: "Community Manager",
    department: "Marketing",
    status: "vacation",
    email: "william.howard@example.com",
    avatar: "https://i.pravatar.cc/150?u=a048581f4e29026701d",
  },
  {
    key: "5",
    name: "Kristen Copper",
    role: "Sales Manager",
    department: "Sales",
    status: "active",
    email: "kristen.copper@example.com",
    avatar: "https://i.pravatar.cc/150?u=a092581d4ef9026700d",
  },
  {
    key: "6",
    name: "Brian Kim",
    role: "Product Manager",
    department: "Product",
    status: "active",
    email: "brian.kim@example.com",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026712d",
  },
  {
    key: "7",
    name: "Michael Hunt",
    role: "Designer",
    department: "Design",
    status: "paused",
    email: "michael.hunt@example.com",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e290267072",
  },
  {
    key: "8",
    name: "Samantha Brooks",
    role: "HR Manager",
    department: "Human Resources",
    status: "active",
    email: "samantha.brooks@example.com",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e27026704d",
  },
  {
    key: "9",
    name: "Emily Davis",
    role: "Software Engineer",
    department: "Development",
    status: "active",
    email: "emily.davis@example.com",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026801d",
  },
  {
    key: "10",
    name: "James Wilson",
    role: "DevOps Engineer",
    department: "Development",
    status: "active",
    email: "james.wilson@example.com",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026802d",
  },
  {
    key: "11",
    name: "Sarah Johnson",
    role: "QA Lead",
    department: "Quality Assurance",
    status: "vacation",
    email: "sarah.johnson@example.com",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026803d",
  },
  {
    key: "12",
    name: "David Martinez",
    role: "Backend Developer",
    department: "Development",
    status: "active",
    email: "david.martinez@example.com",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026804d",
  },
  {
    key: "13",
    name: "Lisa Anderson",
    role: "Frontend Developer",
    department: "Development",
    status: "paused",
    email: "lisa.anderson@example.com",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026805d",
  },
  {
    key: "14",
    name: "Robert Taylor",
    role: "Data Analyst",
    department: "Analytics",
    status: "active",
    email: "robert.taylor@example.com",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026806d",
  },
  {
    key: "15",
    name: "Jennifer White",
    role: "UX Designer",
    department: "Design",
    status: "active",
    email: "jennifer.white@example.com",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026807d",
  },
  {
    key: "16",
    name: "Christopher Lee",
    role: "Security Engineer",
    department: "Security",
    status: "active",
    email: "christopher.lee@example.com",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026808d",
  },
  {
    key: "17",
    name: "Amanda Garcia",
    role: "Content Writer",
    department: "Marketing",
    status: "vacation",
    email: "amanda.garcia@example.com",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026809d",
  },
  {
    key: "18",
    name: "Daniel Brown",
    role: "Mobile Developer",
    department: "Development",
    status: "active",
    email: "daniel.brown@example.com",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026810d",
  },
  {
    key: "19",
    name: "Michelle Thompson",
    role: "Project Manager",
    department: "Management",
    status: "active",
    email: "michelle.thompson@example.com",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026811d",
  },
  {
    key: "20",
    name: "Kevin Rodriguez",
    role: "System Administrator",
    department: "IT",
    status: "paused",
    email: "kevin.rodriguez@example.com",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026812d",
  },
  {
    key: "21",
    name: "Rachel Clark",
    role: "Business Analyst",
    department: "Analytics",
    status: "active",
    email: "rachel.clark@example.com",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026813d",
  },
  {
    key: "22",
    name: "Steven Walker",
    role: "Database Admin",
    department: "IT",
    status: "active",
    email: "steven.walker@example.com",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026814d",
  },
  {
    key: "23",
    name: "Nicole Harris",
    role: "Social Media Manager",
    department: "Marketing",
    status: "active",
    email: "nicole.harris@example.com",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026815d",
  },
  {
    key: "24",
    name: "Andrew King",
    role: "Cloud Architect",
    department: "Development",
    status: "vacation",
    email: "andrew.king@example.com",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026816d",
  },
  {
    key: "25",
    name: "Jessica Scott",
    role: "Scrum Master",
    department: "Management",
    status: "active",
    email: "jessica.scott@example.com",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026817d",
  },
  {
    key: "26",
    name: "Ryan Adams",
    role: "Full Stack Developer",
    department: "Development",
    status: "active",
    email: "ryan.adams@example.com",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026818d",
  },
  {
    key: "27",
    name: "Laura Nelson",
    role: "Technical Writer",
    department: "Documentation",
    status: "paused",
    email: "laura.nelson@example.com",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026819d",
  },
  {
    key: "28",
    name: "Mark Turner",
    role: "Machine Learning Engineer",
    department: "AI",
    status: "active",
    email: "mark.turner@example.com",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026820d",
  },
  {
    key: "29",
    name: "Stephanie Phillips",
    role: "Customer Success Manager",
    department: "Customer Service",
    status: "active",
    email: "stephanie.phillips@example.com",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026821d",
  },
  {
    key: "30",
    name: "Jason Campbell",
    role: "Solutions Architect",
    department: "Development",
    status: "active",
    email: "jason.campbell@example.com",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026822d",
  },
];

type UserType = (typeof users)[number];

const renderCell = (user: UserType, columnKey: string | number) => {
  const cellValue = getKeyValue(user, columnKey);

  switch (columnKey) {
    case "name":
      return (
        <User
          avatarProps={{ radius: "lg", src: user.avatar }}
          description={<span className="text-default-400">{user.email}</span>}
          name={<span className="font-medium">{cellValue}</span>}
        >
          {user.email}
        </User>
      );
    case "status":
      return (
        <Chip
          className="capitalize"
          color={statusColorMap[user.status]}
          size="sm"
          variant="flat"
        >
          {cellValue}
        </Chip>
      );
    case "email":
      return (
        <Tooltip content="Click to copy">
          <span className="cursor-pointer text-default-500">{cellValue}</span>
        </Tooltip>
      );
    case "role":
      return <span className="font-medium text-default-600">{cellValue}</span>;
    case "department":
      return <span className="text-default-500">{cellValue}</span>;
    default:
      return cellValue;
  }
};

const ROWS_PER_PAGE = 8;

export default function TeamTable() {
  const [page, setPage] = useState(1);

  const pages = Math.ceil(users.length / ROWS_PER_PAGE);

  const items = useMemo(() => {
    const start = (page - 1) * ROWS_PER_PAGE;
    const end = start + ROWS_PER_PAGE;
    return users.slice(start, end);
  }, [page]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-5xl font-bold mb-3 text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Team Members
        </h1>
        <p className="text-lg text-default-600 font-normal">
          Manage and view all {users.length} team members in your organization
        </p>
      </div>

      <Table
        aria-label="Team members table with pagination"
        selectionMode="multiple"
        color="primary"
        bottomContent={
          <div className="flex w-full justify-center">
            <Pagination
              isCompact
              showControls
              showShadow
              color="primary"
              page={page}
              total={pages}
              onChange={(page) => setPage(page)}
            />
          </div>
        }
        classNames={{
          wrapper: "min-h-[450px]",
          th: "text-xs font-medium tracking-wider uppercase text-default-400",
          td: "text-sm",
        }}
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn
              key={column.key}
              align={column.key === "actions" ? "center" : "start"}
            >
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody items={items}>
          {(item) => (
            <TableRow key={item.key}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
