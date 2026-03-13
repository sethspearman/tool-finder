using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using QRCoder;
using ToolFinder.Api.Models;

namespace ToolFinder.Api.Services;

public enum LabelSize { Small, Large, XLarge }

public class LabelService
{
    // Avery 94102: 3/4" square.  9 cols × 12 rows = 108 per sheet
    // Avery 94103: 1" square.    7 cols × 9  rows = 63  per sheet
    // Avery 22806: 2" square.    4 cols × 5  rows = 20  per sheet
    private static readonly (float SizePt, int Cols, int Rows, float FontSize, float TextReserve, float Spacing) Small   = (54f,  9, 12, 7f,  14f, 3f);
    private static readonly (float SizePt, int Cols, int Rows, float FontSize, float TextReserve, float Spacing) Large   = (72f,  7,  9, 9f,  18f, 3f);
    // Avery 22806 labels are edge-to-edge on the sheet — no gap between them
    private static readonly (float SizePt, int Cols, int Rows, float FontSize, float TextReserve, float Spacing) XLarge  = (144f, 4,  5, 14f, 28f, 0f);

    public LabelService()
    {
        QuestPDF.Settings.License = LicenseType.Community;
    }

    public (byte[] Pdf, List<string> Ids) GenerateSheet(int count, LabelSize size)
    {
        var (sizePt, cols, rows, fontSize, textReserve, spacing) = size switch
        {
            LabelSize.Small   => Small,
            LabelSize.XLarge  => XLarge,
            _                 => Large,
        };
        var ids = Enumerable.Range(0, count).Select(_ => IdGenerator.Generate()).ToList();

        var pdf = Document.Create(container =>
        {
            // Split ids into pages
            var perPage = cols * rows;
            var pages = ids.Chunk(perPage).ToList();

            foreach (var pageIds in pages)
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.Letter);
                    page.MarginHorizontal(18);   // 0.25"
                    page.MarginVertical(36);     // 0.5"
                    page.Content()
                        .Grid(grid =>
                        {
                            grid.Columns(cols);
                            grid.VerticalSpacing(spacing);
                            grid.HorizontalSpacing(spacing);

                            foreach (var id in pageIds)
                            {
                                grid.Item()
                                    .Width(sizePt)
                                    .Height(sizePt)
                                    .Column(col =>
                                    {
                                        var qrPng = GenerateQrPng(id, (int)sizePt);
                                        col.Item().Height(sizePt - textReserve).Image(qrPng);
                                        col.Item()
                                           .Text(t =>
                                           {
                                               t.AlignCenter();
                                               t.Span(id).FontSize(fontSize).Bold().FontFamily(Fonts.Courier);
                                           });
                                    });
                            }
                        });
                });
            }
        }).GeneratePdf();

        return (pdf, ids);
    }

    public byte[] GenerateSingleLabel(string id, LabelSize size)
    {
        var (sizePt, _, _, fontSize, textReserve, _) = size switch
        {
            LabelSize.Small  => Small,
            LabelSize.XLarge => XLarge,
            _                => Large,
        };
        var qrPng = GenerateQrPng(id, (int)sizePt);

        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(sizePt + 20, sizePt + 20, Unit.Point);
                page.Margin(10);
                page.Content().Column(col =>
                {
                    col.Item().Height(sizePt - textReserve).Image(qrPng);
                    col.Item().Text(t => { t.AlignCenter(); t.Span(id).FontSize(fontSize).Bold().FontFamily(Fonts.Courier); });
                });
            });
        }).GeneratePdf();
    }

    private static byte[] GenerateQrPng(string content, int sizePx)
    {
        using var generator = new QRCodeGenerator();
        var data = generator.CreateQrCode(content, QRCodeGenerator.ECCLevel.M);
        var code = new PngByteQRCode(data);
        // pixelsPerModule: choose a size that gives a clean image at the label size
        return code.GetGraphic(pixelsPerModule: 6);
    }
}
