const ExcelJS = require('exceljs');
const sharp = require('sharp');

function adjustToIST(date) {
  let istOffset = 5 * 60 * 60 * 1000 + 30 * 60 * 1000;
  return new Date(date.getTime() + istOffset);
}

const convertToIST = (timestamp) => {
  const istDate = new Date(timestamp);
  const istDateString = istDate.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
  });
  return istDateString;
};

const convertInAmPm = (givenTimestamp) => {
  let givenDate = new Date(givenTimestamp);

  let istDate = adjustToIST(givenDate);

  let year = istDate.getUTCFullYear();
  let month = istDate.getUTCMonth();
  let day = istDate.getUTCDate();

  let startOfDayIST = new Date(
    Date.UTC(year, month, day, 0, 0, 0) - 5.5 * 60 * 60 * 1000
  ); // 12:00 AM
  let endOfDayIST = new Date(
    Date.UTC(year, month, day, 23, 59, 59) - 5.5 * 60 * 60 * 1000
  ); // 11:59 PMz
  let startOfDayTimestamp = startOfDayIST.getTime();
  let endOfDayTimestamp = endOfDayIST.getTime();
  console.log('Start of day (12:00 AM) IST timestamp:', startOfDayTimestamp);
  console.log('End of day (11:59 PM) IST timestamp:', endOfDayTimestamp);

  return [startOfDayTimestamp, endOfDayTimestamp];
};

function generateXLS(data) {
  try {
    let inn = 0;
    let outt = 0;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Expences', {
      pageSetup: {
        paperSize: 9,
        orientation: 'landscape',
      },
    });

    // Initialize the row index
    let rowIndex = 2;

    let row = worksheet.getRow(rowIndex);
    row.values = [
      'Amount',
      'Description',
      'Category',
      'MoneyType',
      'Owner',
      'Time',
      'Amount In',
      'Amount Out',
      'Balance',
    ];
    row.font = { bold: true };

    const columnWidths = [10, 20, 20, 20, 30, 20, 20, 20, 20];

    row.eachCell((cell, colNumber) => {
      const columnIndex = colNumber - 1;
      const columnWidth = columnWidths[columnIndex];
      worksheet.getColumn(colNumber).width = columnWidth;
    });

    // Loop over the grouped data
    data.forEach((task, index) => {
      if (task.moneyType === 'In') inn += task.amount;
      else outt += task.amount;
      const row = worksheet.getRow(rowIndex + index + 1);
      row.getCell('A').value = task.amount;
      row.getCell('B').value = task.description;
      row.getCell('C').value = task.category;
      row.getCell('D').value = task.moneyType;
      row.getCell('E').value = task.addedBy;
      row.getCell('F').value = convertToIST(task.addedAt);
      row.getCell('G').value = inn;
      row.getCell('H').value = outt;
      row.getCell('I').value = inn - outt;

      row.getCell('B').alignment = { wrapText: true };

      const moneyTypeCell = row.getCell(4);
      if (task.moneyType === 'In') {
        moneyTypeCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF00FF00' }, // Green
        };
      } else {
        moneyTypeCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFF0000' }, // Red
        };
      }
    });

    worksheet.addRow();
    // Increment the row index
    rowIndex += data.length;

    // // Merge cells for the logo
    // worksheet.mergeCells(
    //   `A1:${String.fromCharCode(65 + worksheet.columns.length - 1)}1`
    // );

    // const image = workbook.addImage({
    //   base64: LOGO_64, //replace it your image (base 64 in this case)
    //   extension: 'png',
    // });

    // worksheet.addImage(image, {
    //   tl: { col: 0, row: 0 },
    //   ext: { width: 60, height: 40 },
    // });

    // worksheet.getRow(1).height = 40;

    // Define the border style
    const borderStyle = {
      style: 'medium', // You can use 'thin', 'medium', 'thick', or other valid styles
      color: { argb: '00000000' },
    };

    // Loop through all cells and apply the border style
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        cell.border = {
          top: borderStyle,
          bottom: borderStyle,
        };
      });
    });
    worksheet.columns.forEach((column) => {
      column.alignment = { vertical: 'middle', horizontal: 'center' };
    });
    // Generate the XLS file
    return workbook.xlsx.writeBuffer();
  } catch (err) {
    console.log(err);
  }
}

const resizeUserPhoto = async (buffer) => {
  const buf = await sharp(buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toBuffer();
  return buf;
};
module.exports = {
  convertInAmPm,
  generateXLS,
  resizeUserPhoto,
};
