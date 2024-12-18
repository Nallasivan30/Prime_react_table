import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';

interface Artwork {
    id: number; // Add a unique identifier
    title: string;
    place_of_origin: string;
    artist_display: string;
    inscriptions: string;
    date_start: string;
    date_end: string;
}

const ArtworksTable: React.FC = () => {
    const [artworks, setArtworks] = useState<Artwork[]>([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [selectedArtworksMap, setSelectedArtworksMap] = useState<Record<number, boolean>>({});
    const [rowsToSelect, setRowsToSelect] = useState<number | null>(null);

    const overlayPanelRef = useRef<OverlayPanel>(null);

    useEffect(() => {
        loadArtworks(page);
    }, [page]);

    const loadArtworks = async (currentPage: number) => {
        setLoading(true);
        try {
            const response = await fetch(
                `https://api.artic.edu/api/v1/artworks?page=${currentPage}`
            );
            const { data, pagination } = await response.json();

            setArtworks(data.map((item: any) => ({
                id: item.id, // Ensure the unique identifier is included
                title: item.title,
                place_of_origin: item.place_of_origin,
                artist_display: item.artist_display,
                inscriptions: item.inscriptions,
                date_start: item.date_start,
                date_end: item.date_end,
            })));

            setTotalRecords(pagination.total);
        } catch (error) {
            console.error('Error fetching artworks:', error);
        } finally {
            setLoading(false);
        }
    };

    const onPageChange = (e: any) => {
    setPage(e.page + 1); // Update the page state to reflect the currently selected page
};


    const onRowSelectionChange = (e: { value: Artwork[] }) => {
        // Update the selection map with changes
        const updatedMap = { ...selectedArtworksMap };
        artworks.forEach((artwork) => {
            updatedMap[artwork.id] = e.value.some((selected) => selected.id === artwork.id);
        });
        setSelectedArtworksMap(updatedMap);
    };

    const handleRowSelection = () => {
        if (rowsToSelect && rowsToSelect > 0) {
            const selected = artworks.slice(0, rowsToSelect);
            const updatedMap = { ...selectedArtworksMap };
            selected.forEach((artwork) => {
                updatedMap[artwork.id] = true;
            });
            setSelectedArtworksMap(updatedMap);
        }
        overlayPanelRef.current?.hide();
    };

    const isSelected = (row: Artwork) => selectedArtworksMap[row.id] || false;

    return (
        <div className="card">
            <DataTable
                value={artworks}
                paginator
                rows={10}
                totalRecords={totalRecords}
                lazy
                loading={loading}
                first={(page - 1) * 10}
                onPage={onPageChange}
                responsiveLayout="scroll"
                selection={artworks.filter(isSelected)} // Filter selected rows based on the map
                onSelectionChange={onRowSelectionChange}
                selectionMode="multiple"
            >
                <Column
                    selectionMode="multiple"
                    header={
                        <>
                            <OverlayPanel ref={overlayPanelRef}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <InputNumber
                                        value={rowsToSelect}
                                        onValueChange={(e) => setRowsToSelect(e.value as number | null)}
                                        placeholder="Enter rows to select"
                                        min={1}
                                        max={artworks.length}
                                    />

                                    <Button label="Submit" onClick={handleRowSelection} />
                                </div>
                            </OverlayPanel>

                            <Button
                                icon="pi pi-chevron-down"
                                className="p-button-rounded p-button-secondary  custom-overlay-btn"
                                onClick={(e) => overlayPanelRef.current?.toggle(e)}
                            />
                        </>
                    }
                />
                <Column field="title" header="Title" sortable />
                <Column field="place_of_origin" header="Place of Origin" sortable />
                <Column field="artist_display" header="Artist" sortable />
                <Column field="inscriptions" header="Inscriptions" />
                <Column field="date_start" header="Date Start" />
                <Column field="date_end" header="Date End" />
            </DataTable>

            {/* Pagination Styling */}
            <style>{`

                 .custom-overlay-btn {
                    width: 1.5em;      /* Set the width of the button */
                    height: 1.5em;     /* Set the height to match width */
                }
                .custom-overlay-btn .pi {
                    font-size: 1em;     /* Adjust the size of the icon */
                }


                .custom-overlay-btn {
                width: 2em;
                height: 2em;
                padding: 0.25em;
                margin-right:7px;
                border-radius: 4px;
                
                }
                .custom-overlay-btn:hover {
                    background-color: gray;
                }
                 .p-paginator .p-disabled {
                pointer-events: auto !important; /* Allow interaction with "disabled" buttons */
                opacity: 0.6; /* Maintain a disabled-like appearance */
                }
                
            `}</style>
        </div>
    );
};

export default ArtworksTable;
