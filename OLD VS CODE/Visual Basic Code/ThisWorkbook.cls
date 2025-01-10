VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "ThisWorkbook"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = True
Attribute VB_Exposed = True
'========================================================================
' Module: ThisWorkbook
' Purpose: Handles workbook automation including:
'          1. Table data management for the "Data" worksheet
'          2. Automatic workbook saving every 15 minutes with error protection
'========================================================================

' Timer object to handle automatic saving
Private WithEvents App_Timer As Application
Attribute App_Timer.VB_VarHelpID = -1

' Constants
Private Const SAVE_INTERVAL As Long = 900000 ' 15 minutes in milliseconds (15 * 60 * 1000)

'========================================================================
' Event: Workbook_Open
' Triggered when: The workbook is opened by a user
' Purpose:
'   1. Initializes the table handling system
'   2. Sets up the last row for data entry
'   3. Starts the automatic save timer with error handling
'========================================================================
Private Sub Workbook_Open()
    ' Declare variables for table handling
    Dim loTbl As ListObject        ' Reference to the data table
    Dim lRow As Long              ' Tracks the last row number
    
    '--------------------------------------------------------------------
    ' Table Data Setup Section
    '--------------------------------------------------------------------
    With ThisWorkbook.Worksheets("Data")
        ' Activate the Data worksheet
        .Activate
        
        ' Get reference to the main data table
        Set loTbl = .ListObjects("tblData")
        
        ' Get the current number of rows in the table
        lRow = loTbl.DataBodyRange.Rows.Count
        
        ' Check if the last row needs a timestamp
        ' If the timestamp column is empty in the last row, select it for entry
        If loTbl.ListColumns("Timestamp").DataBodyRange(lRow, 1) = "" Then
            ' Select the second column of the last row
            loTbl.DataBodyRange(lRow, 2).Select
        Else
            ' If last row has a timestamp, we need to add a new row
            
            ' Disable events temporarily to prevent event cascade
            Application.EnableEvents = False
            
            ' Add a new row to the table
            loTbl.ListRows.Add
            
            ' Select the second column of the new row
            loTbl.DataBodyRange(lRow + 1, 2).Select
            
            ' Apply the "Input" style to the selected cell
            Selection.Style = "Input"
            
            ' Re-enable events
            Application.EnableEvents = True
        End If
    End With
    
    '--------------------------------------------------------------------
    ' Auto-Save Setup Section
    '--------------------------------------------------------------------
    On Error Resume Next  ' Add error protection for timer initialization
    
    ' Initialize the timer application object
    Set App_Timer = Application
    
    ' Schedule the first auto-save
    ' Uses TimeSerial to convert milliseconds to Excel time format
    Application.OnTime Now + TimeSerial(0, 0, SAVE_INTERVAL / 1000), "SaveWorkbook"
    
    On Error GoTo 0
End Sub

'========================================================================
' Event: Workbook_BeforeClose
' Triggered when: The workbook is about to be closed
' Purpose: Clean up the auto-save timer to prevent runtime errors
' Note: Includes error handling to ensure clean workbook closure
'========================================================================
Private Sub Workbook_BeforeClose(Cancel As Boolean)
    On Error Resume Next  ' Add error handling in case timer isn't set
    
    ' Cancel any pending auto-save events using explicit parameters
    Application.OnTime _
        EarliestTime:=Now + TimeSerial(0, 0, SAVE_INTERVAL / 1000), _
        Procedure:="SaveWorkbook", _
        Schedule:=False
    
    ' Clear the timer object reference
    Set App_Timer = Nothing
    
    On Error GoTo 0
End Sub

'========================================================================
' Procedure: SaveWorkbook
' Purpose: Performs the actual save operation and schedules the next save
' Called by: The OnTime event every SAVE_INTERVAL milliseconds
' Note: Includes workbook existence check and error handling
'========================================================================
Public Sub SaveWorkbook()
    On Error Resume Next  ' Add error protection for save operations
    
    ' Save the current workbook
    ThisWorkbook.Save
    
    ' Only schedule next save if workbook is still open
    If Not ThisWorkbook Is Nothing Then
        ' Schedule the next auto-save
        ' This creates a recurring schedule of saves every SAVE_INTERVAL
        Application.OnTime Now + TimeSerial(0, 0, SAVE_INTERVAL / 1000), "SaveWorkbook"
    End If
    
    On Error GoTo 0
End Sub

