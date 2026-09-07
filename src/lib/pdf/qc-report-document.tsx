import { Fragment } from "react";
import {
  Document,
  Page,
  View,
  Text,
  Svg,
  Line,
  StyleSheet,
} from "@react-pdf/renderer";
import {
  MATERIAL_CATEGORIES,
  MATERIAL_CATEGORY_LABELS,
  TABLE_1,
  findThicknessBinIndex,
  type MaterialCategory,
} from "@/lib/astm-a123";

// Imperial fraction labels for each THICKNESS_BINS entry, matching the
// printed form. Presentational only, so kept here rather than in the
// framework-agnostic astm-a123.ts.
const THICKNESS_BIN_LABELS = [
  { inch: "<1/16", mm: "<1.6" },
  { inch: "1/16 to <1/8", mm: "1.6 to <3.2" },
  { inch: "1/8 to <3/16", mm: "3.2 to <4.8" },
  { inch: "3/16 to <1/4", mm: "4.8 to <6.4" },
  { inch: "1/4 to <5/8", mm: "6.4 to <16.0" },
  { inch: "5/8", mm: ">16.0" },
];

const CORROSION_RATES = [
  { label: "Severe marine | Oceanfront", rate: "5 - 10", lifeExtent: 15 },
  { label: "Severe Industrial", rate: "4 - 9", lifeExtent: 20 },
  { label: "Industrial | Metropolitan", rate: "3 - 5", lifeExtent: 35 },
  { label: "Urban | Domestic", rate: "2 - 3", lifeExtent: 45 },
  { label: "Rural", rate: "Less than 2", lifeExtent: 55 },
];

const INK = "#1a1d21";
const SLATE = "#5b6470";
const STEEL = "#c7cdd4";
const STAMP_RED = "#b3122b";
const BLUEPRINT = "#1b3a6b";

const styles = StyleSheet.create({
  page: {
    padding: 24,
    fontSize: 8,
    fontFamily: "Helvetica",
    color: INK,
  },
  headerRow: {
    borderBottomWidth: 2,
    borderBottomColor: STAMP_RED,
    paddingBottom: 8,
    marginBottom: 8,
  },
  title: {
    fontFamily: "Helvetica-Bold",
    fontSize: 13,
    letterSpacing: 0.5,
    color: INK,
  },
  subtitle: {
    fontFamily: "Helvetica-Oblique",
    fontSize: 9,
    color: STAMP_RED,
    marginTop: 2,
  },

  fieldsRow: { flexDirection: "row", gap: 24, marginBottom: 10 },
  fieldStack: { flex: 1 },
  fieldLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 7,
    color: SLATE,
    letterSpacing: 0.4,
  },
  fieldValue: {
    fontSize: 9.5,
    marginTop: 2,
    borderBottomWidth: 1,
    borderBottomColor: STEEL,
    paddingBottom: 3,
  },

  table: {
    borderWidth: 1,
    borderColor: INK,
    marginBottom: 10,
  },
  tr: { flexDirection: "row" },
  thCenter: {
    fontFamily: "Helvetica-Bold",
    fontSize: 6,
    textAlign: "center",
    padding: 3,
    borderRightWidth: 1,
    borderRightColor: INK,
    borderBottomWidth: 1,
    borderBottomColor: INK,
    justifyContent: "center",
  },
  td: {
    fontSize: 7.5,
    textAlign: "center",
    padding: 3,
    borderRightWidth: 1,
    borderRightColor: INK,
    justifyContent: "center",
  },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: STEEL },
  // A column that describes the whole inspection (customer, material, SPK,
  // thickness, qty, overall average) rather than one of the three specimen
  // rows. Rendered as a single cell stretched to the full body-row height
  // (see `body` below, a row container with no rowDivider inside it) so it
  // reads as one merged cell instead of three separate boxes.
  mergedCell: {
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: INK,
    paddingHorizontal: 3,
  },
  mergedCellText: { fontSize: 7.5, textAlign: "center" },
  specimenRows: { flexDirection: "column", flex: 1 },

  sectionTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 6.5,
    color: SLATE,
    marginBottom: 4,
  },

  refTable: { borderWidth: 1, borderColor: INK, marginBottom: 4 },
  refHeadCell: {
    fontSize: 6,
    textAlign: "center",
    padding: 3,
    borderRightWidth: 1,
    borderRightColor: INK,
    borderBottomWidth: 1,
    borderBottomColor: INK,
    justifyContent: "center",
  },
  refHeadCellHighlight: { backgroundColor: "#f6dfe3" },
  refCategoryCell: {
    fontSize: 6.5,
    padding: 3,
    borderRightWidth: 1,
    borderRightColor: INK,
    justifyContent: "center",
  },
  refValueCell: {
    fontSize: 7,
    textAlign: "center",
    padding: 3,
    borderRightWidth: 1,
    borderRightColor: INK,
    justifyContent: "center",
  },
  refValueCellHighlight: {
    backgroundColor: "#f6dfe3",
    fontFamily: "Helvetica-Bold",
    color: STAMP_RED,
  },
  refFootnote: { fontSize: 5.5, color: SLATE, lineHeight: 1.3 },

  footerRow: { marginTop: 10 },

  resultBanner: {
    marginTop: 10,
    borderWidth: 1.5,
    padding: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  resultLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    letterSpacing: 1,
  },
});

export interface QcReportData {
  companyName: string;
  materialName: string;
  spk: string;
  materialDescription: string;
  inspectionDate: Date;
  quantityValue: number;
  steelThicknessMm: number;
  materialCategory: MaterialCategory;
  measurements: number[]; // 18 values, row-major r1c1..r3c6
  averageThicknessUm: number;
  minimumRequiredUm: number | null;
  result: "PASS" | "FAIL" | "NO_STANDARD";
}

const RESULT_COPY: Record<QcReportData["result"], { label: string; color: string }> = {
  PASS: { label: "LULUS / PASS", color: BLUEPRINT },
  FAIL: { label: "TIDAK LULUS / FAIL", color: STAMP_RED },
  NO_STANDARD: { label: "TANPA STANDAR / NO STANDARD", color: SLATE },
};

// Fixed pixel size: Svg does not scale to fill its container, so this is
// sized to the full page content width.
const CHART_WIDTH = 540;
const CHART_HEIGHT = 108;

function CorrosionChart() {
  const originX = 30;
  const rightEdge = CHART_WIDTH - 6;
  const originY = CHART_HEIGHT - 18;
  const topY = 10;
  const xTicks = [0, 15, 30, 45, 55];
  const xScale = (value: number) => originX + (value / 55) * (rightEdge - originX);

  return (
    <Svg width={CHART_WIDTH} height={CHART_HEIGHT} viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}>
      <Line x1={originX} y1={topY} x2={originX} y2={originY} stroke={INK} strokeWidth={0.75} />
      <Line
        x1={originX}
        y1={originY}
        x2={rightEdge}
        y2={originY}
        stroke={INK}
        strokeWidth={0.75}
      />
      {xTicks.map((tick) => (
        <Text
          key={tick}
          x={xScale(tick) - 3}
          y={originY + 9}
          style={{ fontSize: 5, fill: SLATE }}
        >
          {tick}
        </Text>
      ))}
      <Text x={originX + 90} y={originY + 16} style={{ fontSize: 5.5, fill: INK }}>
        Life (years)
      </Text>
      <Text
        x={0}
        y={topY - 3}
        style={{ fontSize: 5.5, fill: INK, fontFamily: "Helvetica-Bold" }}
      >
        Microns / year
      </Text>
      {CORROSION_RATES.map((band, index) => {
        const y = topY + 8 + index * 12;
        return (
          <Fragment key={band.label}>
            <Text x={originX + 2} y={y - 1} style={{ fontSize: 4.6, fill: INK }}>
              {band.rate} {band.label}
            </Text>
            <Line
              x1={originX}
              y1={y + 2}
              x2={xScale(band.lifeExtent)}
              y2={y + 2}
              stroke={STAMP_RED}
              strokeWidth={0.9}
            />
          </Fragment>
        );
      })}
    </Svg>
  );
}

// Flex ratios for the measurement table's columns, shared by both header
// rows and the body so they stay aligned. Weighted so the six actual
// measurement columns (the point of the report) get real room instead of
// being squeezed by the wide descriptive columns on the left.
const COLS = {
  customer: 2,
  material: 2,
  spk: 1.1,
  thickness: 1.1,
  qty: 1,
  refArea: 0.9,
  measurement: 1,
  overallAvg: 1.6,
};
const LOCAL_AREA_FLEX = COLS.refArea + 6 * COLS.measurement;

export function QcReportDocument({ data }: { data: QcReportData }) {
  const binIndex = findThicknessBinIndex(data.steelThicknessMm);
  const resultCopy = RESULT_COPY[data.result];

  const areas = [0, 1, 2].map((rowIndex) => ({
    ref: rowIndex + 1,
    values: data.measurements.slice(rowIndex * 6, rowIndex * 6 + 6),
  }));

  return (
    <Document title={`Laporan QC ${data.spk} - ${data.materialName}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>COATING THICKNESS GALVANIZED STEEL</Text>
          <Text style={styles.subtitle}>Ketebalan Lapisan Galvanis</Text>
        </View>

        <View style={styles.fieldsRow}>
          <View style={styles.fieldStack}>
            <Text style={styles.fieldLabel}>CUSTOMER</Text>
            <Text style={styles.fieldValue}>{data.companyName}</Text>
          </View>
          <View style={styles.fieldStack}>
            <Text style={styles.fieldLabel}>DATE</Text>
            <Text style={styles.fieldValue}>
              {data.inspectionDate.toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </Text>
          </View>
          <View style={styles.fieldStack}>
            <Text style={styles.fieldLabel}>SPK</Text>
            <Text style={styles.fieldValue}>{data.spk}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tr}>
            {/* Single tall header cells, matching the merged body cells
                below them — only "Local Area Thickness" has a real
                two-row sub-header (Ref Area / 1-6), so only it is split
                into its own nested column. */}
            <Text style={[styles.thCenter, { flex: COLS.customer }]}>
              Customer Detail
            </Text>
            <Text style={[styles.thCenter, { flex: COLS.material }]}>
              Material Name
            </Text>
            <Text style={[styles.thCenter, { flex: COLS.spk }]}>No. SPK</Text>
            <Text style={[styles.thCenter, { flex: COLS.thickness }]}>
              Thickness (mm)
            </Text>
            <Text style={[styles.thCenter, { flex: COLS.qty }]}>Qty (Pcs)</Text>

            <View style={{ flexDirection: "column", flex: LOCAL_AREA_FLEX }}>
              <Text style={styles.thCenter}>Local Area Thickness</Text>
              <View style={styles.tr}>
                <Text style={[styles.thCenter, { flex: COLS.refArea }]}>
                  Ref Area
                </Text>
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <Text
                    key={n}
                    style={[styles.thCenter, { flex: COLS.measurement }]}
                  >
                    {n}
                  </Text>
                ))}
              </View>
            </View>

            <Text
              style={[
                styles.thCenter,
                { flex: COLS.overallAvg, borderRightWidth: 0 },
              ]}
            >
              Overall Average (µm)
            </Text>
          </View>

          <View style={styles.tr}>
            <View style={[styles.mergedCell, { flex: COLS.customer }]}>
              <Text style={styles.mergedCellText}>{data.companyName}</Text>
            </View>
            <View style={[styles.mergedCell, { flex: COLS.material }]}>
              <Text style={styles.mergedCellText}>{data.materialName}</Text>
            </View>
            <View style={[styles.mergedCell, { flex: COLS.spk }]}>
              <Text style={styles.mergedCellText}>{data.spk}</Text>
            </View>
            <View style={[styles.mergedCell, { flex: COLS.thickness }]}>
              <Text style={styles.mergedCellText}>{data.steelThicknessMm}</Text>
            </View>
            <View style={[styles.mergedCell, { flex: COLS.qty }]}>
              <Text style={styles.mergedCellText}>{data.quantityValue}</Text>
            </View>

            <View style={[styles.specimenRows, { flex: LOCAL_AREA_FLEX }]}>
              {areas.map((area, index) => (
                <View
                  key={area.ref}
                  style={[
                    styles.tr,
                    index < areas.length - 1 ? styles.rowDivider : undefined,
                  ]}
                >
                  <Text style={[styles.td, { flex: COLS.refArea }]}>
                    {area.ref}
                  </Text>
                  {area.values.map((value, colIndex) => (
                    <Text
                      key={colIndex}
                      style={[styles.td, { flex: COLS.measurement }]}
                    >
                      {value}
                    </Text>
                  ))}
                </View>
              ))}
            </View>

            <View
              style={[
                styles.mergedCell,
                { flex: COLS.overallAvg, borderRightWidth: 0 },
              ]}
            >
              <Text style={styles.mergedCellText}>
                {data.averageThicknessUm.toFixed(1)}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          Minimum Average Coating Thickness Grade by Material Category
        </Text>
        <Text style={styles.sectionSubtitle}>
          All Specimens Tested Steel Thickness Range (Measured), in. [mm]
        </Text>
        <View style={styles.refTable}>
          <View style={styles.tr}>
            <Text style={[styles.refHeadCell, { width: 96, textAlign: "left" }]}>
              Material Category
            </Text>
            {THICKNESS_BIN_LABELS.map((bin, index) => (
              <View
                key={bin.inch}
                style={[
                  styles.refHeadCell,
                  { flex: 1 },
                  index === THICKNESS_BIN_LABELS.length - 1
                    ? { borderRightWidth: 0 }
                    : undefined,
                  index === binIndex ? styles.refHeadCellHighlight : undefined,
                ]}
              >
                <Text style={{ fontFamily: "Helvetica-Bold" }}>{bin.inch}</Text>
                <Text>{bin.mm}</Text>
              </View>
            ))}
          </View>
          {MATERIAL_CATEGORIES.map((category) => (
            <View key={category} style={styles.tr}>
              <Text style={[styles.refCategoryCell, { width: 96 }]}>
                {MATERIAL_CATEGORY_LABELS[category]}
              </Text>
              {TABLE_1[category].map((value, index) => (
                <Text
                  key={index}
                  style={[
                    styles.refValueCell,
                    { flex: 1 },
                    index === THICKNESS_BIN_LABELS.length - 1
                      ? { borderRightWidth: 0 }
                      : undefined,
                    index === binIndex && category === data.materialCategory
                      ? styles.refValueCellHighlight
                      : undefined,
                  ]}
                >
                  {value ?? "-"}
                </Text>
              ))}
            </View>
          ))}
        </View>
        <Text style={styles.refFootnote}>
          The values in micrometres (µm) are based on Coating Grade. The other
          values are based on conversions using the following formulas:
          mils = µm x 0.0937; oz/ft2 = µm x 0.02316; g/m2 = µm x 7.067.
        </Text>

        <View style={styles.footerRow}>
          <CorrosionChart />
        </View>

        <View style={[styles.resultBanner, { borderColor: resultCopy.color }]}>
          <Text style={{ fontSize: 7, color: SLATE }}>
            Rata-rata {data.averageThicknessUm.toFixed(1)} µm terhadap standar
            minimum{" "}
            {data.minimumRequiredUm !== null
              ? `${data.minimumRequiredUm} µm`
              : "(tidak ada standar untuk kombinasi ini)"}
          </Text>
          <Text style={[styles.resultLabel, { color: resultCopy.color }]}>
            {resultCopy.label}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
