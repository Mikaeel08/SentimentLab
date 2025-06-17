import jsPDF from 'jspdf';
import Papa from 'papaparse';
import { format } from 'date-fns';
import { SentimentResult, BatchResult, ExportOptions } from '../types/sentiment';

class ExportService {
  exportToCSV(results: SentimentResult[], options: ExportOptions): void {
    const data = results
      .filter(result => this.isWithinDateRange(result, options.dateRange))
      .map(result => {
        const row: any = {
          text: result.text,
          sentiment: result.sentiment,
        };
        
        if (options.includeConfidence) {
          row.confidence = (result.confidence * 100).toFixed(2) + '%';
          row.positive_score = (result.scores.positive * 100).toFixed(2) + '%';
          row.negative_score = (result.scores.negative * 100).toFixed(2) + '%';
          row.neutral_score = (result.scores.neutral * 100).toFixed(2) + '%';
        }
        
        if (options.includeKeywords) {
          row.keywords = result.keywords.map(k => k.word).join(', ');
        }
        
        if (options.includeTimestamp) {
          row.timestamp = format(result.timestamp, 'yyyy-MM-dd HH:mm:ss');
        }
        
        return row;
      });

    const csv = Papa.unparse(data);
    this.downloadFile(csv, 'sentiment-analysis-results.csv', 'text/csv');
  }

  exportToJSON(results: SentimentResult[], options: ExportOptions): void {
    const filteredResults = results
      .filter(result => this.isWithinDateRange(result, options.dateRange))
      .map(result => {
        const exported: any = {
          id: result.id,
          text: result.text,
          sentiment: result.sentiment,
        };
        
        if (options.includeConfidence) {
          exported.confidence = result.confidence;
          exported.scores = result.scores;
        }
        
        if (options.includeKeywords) {
          exported.keywords = result.keywords;
        }
        
        if (options.includeTimestamp) {
          exported.timestamp = result.timestamp.toISOString();
        }
        
        return exported;
      });

    const json = JSON.stringify({
      exported_at: new Date().toISOString(),
      total_results: filteredResults.length,
      results: filteredResults
    }, null, 2);

    this.downloadFile(json, 'sentiment-analysis-results.json', 'application/json');
  }

  exportToPDF(results: SentimentResult[], options: ExportOptions): void {
    const doc = new jsPDF();
    const filteredResults = results.filter(result => this.isWithinDateRange(result, options.dateRange));
    
    // Title
    doc.setFontSize(20);
    doc.text('Sentiment Analysis Report', 20, 30);
    
    // Summary
    doc.setFontSize(12);
    doc.text(`Generated: ${format(new Date(), 'PPpp')}`, 20, 45);
    doc.text(`Total Results: ${filteredResults.length}`, 20, 55);
    
    const summary = this.calculateSummary(filteredResults);
    doc.text(`Positive: ${summary.positive} (${((summary.positive / filteredResults.length) * 100).toFixed(1)}%)`, 20, 65);
    doc.text(`Negative: ${summary.negative} (${((summary.negative / filteredResults.length) * 100).toFixed(1)}%)`, 20, 75);
    doc.text(`Neutral: ${summary.neutral} (${((summary.neutral / filteredResults.length) * 100).toFixed(1)}%)`, 20, 85);
    
    // Results
    let yPosition = 105;
    doc.setFontSize(14);
    doc.text('Results:', 20, yPosition);
    yPosition += 15;
    
    doc.setFontSize(10);
    filteredResults.slice(0, 10).forEach((result, index) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.text(`${index + 1}. ${result.text.substring(0, 80)}${result.text.length > 80 ? '...' : ''}`, 20, yPosition);
      yPosition += 8;
      doc.text(`   Sentiment: ${result.sentiment.toUpperCase()}`, 25, yPosition);
      
      if (options.includeConfidence) {
        doc.text(`   Confidence: ${(result.confidence * 100).toFixed(1)}%`, 100, yPosition);
      }
      
      yPosition += 12;
    });
    
    if (filteredResults.length > 10) {
      doc.text(`... and ${filteredResults.length - 10} more results`, 20, yPosition);
    }
    
    doc.save('sentiment-analysis-report.pdf');
  }

  exportBatchToPDF(batch: BatchResult): void {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.text('Batch Analysis Report', 20, 30);
    
    // Batch info
    doc.setFontSize(12);
    doc.text(`Batch: ${batch.name}`, 20, 45);
    doc.text(`Created: ${format(batch.createdAt, 'PPpp')}`, 20, 55);
    doc.text(`Total Texts: ${batch.summary.totalTexts}`, 20, 65);
    doc.text(`Average Confidence: ${(batch.summary.averageConfidence * 100).toFixed(1)}%`, 20, 75);
    
    // Summary
    doc.text(`Positive: ${batch.summary.positiveCount} (${((batch.summary.positiveCount / batch.summary.totalTexts) * 100).toFixed(1)}%)`, 20, 90);
    doc.text(`Negative: ${batch.summary.negativeCount} (${((batch.summary.negativeCount / batch.summary.totalTexts) * 100).toFixed(1)}%)`, 20, 100);
    doc.text(`Neutral: ${batch.summary.neutralCount} (${((batch.summary.neutralCount / batch.summary.totalTexts) * 100).toFixed(1)}%)`, 20, 110);
    
    doc.save(`batch-analysis-${batch.name}.pdf`);
  }

  private isWithinDateRange(result: SentimentResult, dateRange?: { start: Date; end: Date }): boolean {
    if (!dateRange) return true;
    return result.timestamp >= dateRange.start && result.timestamp <= dateRange.end;
  }

  private calculateSummary(results: SentimentResult[]) {
    return results.reduce(
      (acc, result) => {
        acc[result.sentiment]++;
        return acc;
      },
      { positive: 0, negative: 0, neutral: 0 }
    );
  }

  private downloadFile(content: string, filename: string, contentType: string): void {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export const exportService = new ExportService();