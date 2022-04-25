import * as React from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import { styled } from "@mui/material/styles";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  AreaChart,
  Area,
  Tooltip,
  XAxis,
  YAxis,
  Sector,
} from "recharts";
import { DataGrid, GridColDef} from "@mui/x-data-grid";
import { useCallback, useState } from "react";
import {
  checkboxFieldType,
  numericFieldType,
  radioFieldType,
  stringFieldType,
  PollFieldType,
  fieldTypes,
} from "../../../api/pollCollection";

export const OverviewGrid = ({
  fields,
}: {
  fields: PollFieldType[];
}): JSX.Element => {
  const columns: GridColDef[] = [{ field: "id", headerName: "ID", width: 90 }];
  // const rows = [];
  fields?.forEach((f, i) => {
    columns[i + 1] = {
      ...columns[i + 1],
      field: f.description,
      headerName: f.description,
      flex: 300,
    };
  });

  const rows = fields[0]?.results?.map((r, resultsIndex) => {
    const emptyobj: Record<string, unknown> = {};
    fields.forEach((f) => {
      const data = () => {
        switch (f.fieldType) {
          case fieldTypes.radio:
            return f.choiceOptions[f.results[resultsIndex]?.data];
          case fieldTypes.checkbox: {
            const d = [];
            f.choiceOptions.forEach((c, i) => {
              if (f.results[resultsIndex]?.data[i]) {
                d.push(c);
              }
            });
            return d;
          }
          default:
            return f.results[resultsIndex]?.data;
        }
      };
      emptyobj[`${f.description}`] = data();

      // console.log(f.results[resultsIndex]?.data);
    });
    return {
      ...emptyobj,
      id: resultsIndex + 1,
    };
  });

  return (
    <div style={{ height: 400, width: "100%" }}>
      <DataGrid
        rows={rows || []}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5]}
      />
    </div>
  );
};

export const TextChart = ({
  results,
}: {
  results: stringFieldType["results"];
}): JSX.Element => {
  const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: "center",
    color: theme.palette.text.secondary,
  }));
  return (
    <Box sx={{ width: "100%" }}>
      <Stack spacing={2}>
        {results.map((r) => (
          <Item key={JSON.stringify({ r })}>{r.data}</Item>
        ))}
      </Stack>
    </Box>
  );
};

export const NumericChart = ({
  results,
}: {
  results: numericFieldType["results"];
}): JSX.Element => {
  const data = [];
  results.forEach((r, i) => {
    data.push({
      name: `poll${i + 1}`,
      value: r.data,
    });
  });
  return (
    <AreaChart
      width={500}
      height={400}
      data={data}
      margin={{
        top: 10,
        right: 30,
        left: 0,
        bottom: 0,
      }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Area
        type="monotone"
        dataKey="value"
        stroke="#8884d8"
        fill="#8884d8"
        fillOpacity={0.3}
      />
    </AreaChart>
  );
};

export const RadioChart = ({
  results,
  choiceOptions,
}: {
  results: radioFieldType["results"];
  choiceOptions: radioFieldType["choiceOptions"];
}): JSX.Element => {
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];
  const data = [];
  choiceOptions.forEach((c) => {
    data.push({
      name: c,
      value: 0,
    });
  });
  results.forEach((r, i) => {
    data[r.data] = {
      ...data[r.data],
      value: data[r.data].value + 1,
    };
  });

  const renderActiveShape = (props: any) => {
    const RADIAN = Math.PI / 180;
    const {
      cx,
      cy,
      midAngle,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle,
      fill,
      payload,
      percent,
      value,
    } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? "start" : "end";

    return (
      <g>
        <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
          {payload.name}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
        <path
          d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
          stroke={fill}
          fill="none"
        />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text
          x={ex + (cos >= 0 ? 1 : -1) * 12}
          y={ey}
          textAnchor={textAnchor}
          fill="#333"
        >{`Total ${value}`}</text>
        <text
          x={ex + (cos >= 0 ? 1 : -1) * 12}
          y={ey}
          dy={18}
          textAnchor={textAnchor}
          fill="#999"
        >
          {`(Rate ${(percent * 100).toFixed(2)}%)`}
        </text>
      </g>
    );
  };
  const [activeIndex, setActiveIndex] = useState(0);
  const onPieEnter = useCallback(
    (_, index) => {
      setActiveIndex(index);
    },
    [setActiveIndex]
  );

  return (
    <PieChart width={400} height={400}>
      <Pie
        activeIndex={activeIndex}
        activeShape={renderActiveShape}
        data={data}
        cx={200}
        cy={200}
        innerRadius={60}
        outerRadius={80}
        fill="#8884d8"
        dataKey="value"
        onMouseEnter={onPieEnter}
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % 4]} />
        ))}
      </Pie>
    </PieChart>
  );
};

export const CheckboxChart = ({
  results,
  choiceOptions,
}: {
  results: checkboxFieldType["results"];
  choiceOptions: radioFieldType["choiceOptions"];
}): JSX.Element => {
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  const data = [];
  choiceOptions.forEach((c) => {
    data.push({
      name: c,
      total: 0,
    });
  });
  results.forEach((r) => {
    r.data.forEach((e, i) => {
      if (e) {
        data[i] = {
          ...data[i],
          total: data[i].total + 1,
        };
      }
    });
  });
  return (
    <BarChart
      width={500}
      height={300}
      data={data}
      margin={{
        top: 20,
        right: 30,
        left: 20,
        bottom: 5,
      }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar dataKey="total" stackId="a" fill="#8884d8">
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % 4]} />
        ))}
      </Bar>
    </BarChart>
  );
};
