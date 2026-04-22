import { IInputs, IOutputs } from "./generated/ManifestTypes";
import { ArtavistaDashboardUI, IArtavistaDashboardUIProps } from "./HelloWorld";
import * as React from "react";

export class ArtavistaDashboard implements ComponentFramework.ReactControl<IInputs, IOutputs> {
    private notifyOutputChanged: () => void;
    private context: ComponentFramework.Context<IInputs>;
    private currentAction: string = "";
    private currentRecordId: string = "";

    constructor() { }

    public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, _state: ComponentFramework.Dictionary): void {
        this.notifyOutputChanged = notifyOutputChanged;
        this.context = context;
        this.context.mode.trackContainerResize(true);
    }

    public updateView(context: ComponentFramework.Context<IInputs>): React.ReactElement {
        this.context = context;

        // ─── Helper: aman ambil string, hindari null/undefined ───
        const s = (val: string | null | undefined, fallback = ""): string =>
            (val !== null && val !== undefined && val !== "") ? val : fallback;

        // ═══════════════════════════════════════════════
        // DATASET 1: Transaksi — SharePoint: ART_Transaksi
        // ═══════════════════════════════════════════════
        const contentDS = context.parameters.ContentList;
        let remoteContents: any[] = [];
        if (contentDS && !contentDS.loading && contentDS.sortedRecordIds) {
            remoteContents = contentDS.sortedRecordIds.map(id => {
                const r = contentDS.records[id];
                return {
                    id: r.getRecordId(),
                    title:    s(r.getFormattedValue("colTitle"),    "Tanpa Nama"),
                    platform: s(r.getFormattedValue("colPlatform"), "Tidak diketahui"),
                    date:     s(r.getFormattedValue("colDate"),     "-"),
                    status:   s(r.getFormattedValue("colStatus"),   "Pending"),
                    // colAmount → SP kolom "NilaiProyek" tipe Number/Currency
                    amount:   s(r.getFormattedValue("colAmount"),   "0"),
                };
            });
        }

        // ═══════════════════════════════════════════════
        // DATASET 2: Produk — SharePoint: ART_Produk
        // ═══════════════════════════════════════════════
        const productDS = context.parameters.ProductList;
        let remoteProducts: any[] = [];
        if (productDS && !productDS.loading && productDS.sortedRecordIds) {
            remoteProducts = productDS.sortedRecordIds.map(id => {
                const r = productDS.records[id];
                return {
                    id:          r.getRecordId(),
                    name:        s(r.getFormattedValue("colProdName"),     "Produk"),
                    category:    s(r.getFormattedValue("colProdCategory"), "Umum"),
                    price:       s(r.getFormattedValue("colProdPrice"),    "0"),
                    sold:        s(r.getFormattedValue("colProdSold"),     "0"),
                    description: s(r.getFormattedValue("colProdDesc"),     ""),
                    imageUrl:    s(r.getFormattedValue("colProdImage"),    ""),
                };
            });
        }

        // ═══════════════════════════════════════════════
        // DATASET 3: Klien — SharePoint: ART_Klien
        // ═══════════════════════════════════════════════
        const customerDS = context.parameters.CustomerList;
        let remoteCustomers: any[] = [];
        if (customerDS && !customerDS.loading && customerDS.sortedRecordIds) {
            remoteCustomers = customerDS.sortedRecordIds.map(id => {
                const r = customerDS.records[id];
                return {
                    id:      r.getRecordId(),
                    name:    s(r.getFormattedValue("colCustName"),    "Klien"),
                    contact: s(r.getFormattedValue("colCustContact"), "-"),
                    email:   s(r.getFormattedValue("colCustEmail"),   ""),
                    phone:   s(r.getFormattedValue("colCustPhone"),   ""),
                    spent:   s(r.getFormattedValue("colCustSpent"),   "0"),
                    status:  s(r.getFormattedValue("colCustStatus"),  "Aktif"),
                };
            });
        }

        // ═══════════════════════════════════════════════
        // DATASET 4: Jadwal — SharePoint: ART_Jadwal  ← BARU
        // ═══════════════════════════════════════════════
        const scheduleDS = context.parameters.ScheduleList;
        let remoteSchedules: any[] = [];
        if (scheduleDS && !scheduleDS.loading && scheduleDS.sortedRecordIds) {
            remoteSchedules = scheduleDS.sortedRecordIds.map(id => {
                const r = scheduleDS.records[id];
                const progressRaw = r.getFormattedValue("colSchedProgress");
                return {
                    id:         r.getRecordId(),
                    title:      s(r.getFormattedValue("colSchedTitle"),    "Proyek"),
                    clientName: s(r.getFormattedValue("colSchedClient"),   "-"),
                    startDate:  s(r.getFormattedValue("colSchedStart"),    ""),
                    deadline:   s(r.getFormattedValue("colSchedDeadline"), ""),
                    // Progress dari SP adalah angka 0-100
                    progress:   Math.min(100, Math.max(0, parseInt(progressRaw || "0") || 0)),
                    status:     s(r.getFormattedValue("colSchedStatus"),   "Belum Mulai"),
                    pic:        s(r.getFormattedValue("colSchedPIC"),      "-"),
                    notes:      s(r.getFormattedValue("colSchedNotes"),    ""),
                };
            });
        }

        // ─── Handler aksi user (output ke Power Apps) ───
        const handleTriggerAction = (actionName: string, recordId?: string) => {
            this.currentAction = actionName;
            this.currentRecordId = recordId || "";
            this.notifyOutputChanged();
            setTimeout(() => {
                this.currentAction = "";
                this.currentRecordId = "";
                this.notifyOutputChanged();
            }, 500);
        };

        const props: IArtavistaDashboardUIProps = {
            userName:  s(context.parameters.UserName.raw,  "Admin"),
            totalTask: s(context.parameters.TotalTask.raw, "0"),
            userRole:  s(context.parameters.UserRole.raw,  "Admin"),
            contents:  remoteContents,
            products:  remoteProducts,
            customers: remoteCustomers,
            schedules: remoteSchedules,
            triggerAction: handleTriggerAction,
            logoSrc:   context.parameters.LogoInput?.raw   || "",
            bannerSrc: context.parameters.BannerInput?.raw || "",
        };

        return React.createElement(ArtavistaDashboardUI, props);
    }

    public getOutputs(): IOutputs {
        return {
            ClickedAction:    this.currentAction,
            SelectedRecordId: this.currentRecordId,
        };
    }

    public destroy(): void { }
}