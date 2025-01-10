VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "Sheet1"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = True
Attribute VB_Exposed = True
'========================================================================
' Module: Sheet1 (Data)
' Purpose: Handles worksheet events for data entry automation including:
'          1. Data validation and entry workflow
'          2. PLC tag value management
'          3. Cell styling and selection handling
'          4. Automated workflow progression
'========================================================================

'========================================================================
' Event: Worksheet_Change
' Triggered when: Cell values are changed in the worksheet
' Purpose: Manages the data entry workflow and PLC communication
'========================================================================
Private Sub Worksheet_Change(ByVal Target As Range)
    ' Declare objects for handling table data and PLC communication
    Dim loData As ListObject      ' Reference to main data table
    Dim loPLC As ListObject       ' Reference to PLC write table
    Dim lRow As Long             ' Row counter
    Dim wsLinx As Worksheet      ' Reference to RSLinx worksheet
    Dim bUpdate As Boolean       ' Flag to trigger PLC tag updates
    
    ' Disable events to prevent recursive triggers
    Application.EnableEvents = False
    On Error GoTo ErrHandler
    
    ' Initialize table references
    Set loData = Me.ListObjects("tblData")
    Set wsLinx = ThisWorkbook.Worksheets("RSLinx")
    Set loPLC = wsLinx.ListObjects("tblPLCWrite")
    
    '--------------------------------------------------------------------
    ' Double Scan Prevention
    '--------------------------------------------------------------------
    ' Check if the changed cell is in the data range but not timestamp
    If Not Intersect(Target, loData.DataBodyRange) Is Nothing And _
            Intersect(Target, loData.ListColumns("Timestamp").DataBodyRange) Is Nothing _
            Then
        
        ' If new value matches previous scan, mark as error
        If Target.Offset(0, -1).Value = Target.Value Then
            Target.Style = "Bad"
            Target.Select
            GoTo EOF
        End If
    End If
    
    '--------------------------------------------------------------------
    ' Step 1: User Entry
    '--------------------------------------------------------------------
    If Not Intersect(Target, loData.ListColumns("User").DataBodyRange) Is Nothing Then
        ' Update PLC with username
        SetTagValue "UserName", Target.Value
        
        ' Add timestamp to the entry
        Me.Cells(Target.Row, loData.ListColumns("Timestamp").Range.Column).Value = Now()
        
        ' Move to Step 2
        SetTagValue "StepNumber", 2
        Me.Cells(Target.Row, loData.ListColumns("Job MO").Range.Column).Select
        
        bUpdate = True
    End If
    
    '--------------------------------------------------------------------
    ' Step 2: Job MO Entry
    '--------------------------------------------------------------------
    If Not Intersect(Target, loData.ListColumns("Job MO").DataBodyRange) Is Nothing Then
        ' Update PLC with MO number
        SetTagValue "MONumber", Target.Value
        
        ' Move to Step 3
        SetTagValue "StepNumber", 3
        Me.Cells(Target.Row, loData.ListColumns("Item").Range.Column).Select
        
        bUpdate = True
    End If
    
    '--------------------------------------------------------------------
    ' Step 3: Cable Item Number Entry
    '--------------------------------------------------------------------
    If Not Intersect(Target, loData.ListColumns("Item").DataBodyRange) Is Nothing Then
        ' Update PLC with item number
        SetTagValue "ItemNumber", Target.Value
        
        ' Move to Step 4
        SetTagValue "StepNumber", 4
        Me.Cells(Target.Row, loData.ListColumns("Quantity (Feet)").Range.Column).Select
        
        bUpdate = True
    End If
    
    '--------------------------------------------------------------------
    ' Step 4: Quantity Entry and Row Completion
    '--------------------------------------------------------------------
    If Not Intersect(Target, loData.ListColumns("Quantity (Feet)").DataBodyRange) Is Nothing Then
        ' Add new row for next entry
        loData.ListRows.Add
        
        ' Select user field in new row
        Me.Cells(Target.Row + 1, loData.ListColumns("User").Range.Column).Select
        
        ' Clear PLC write values
        loPLC.ListColumns("Value").DataBodyRange.ClearContents
        
        ' Reset to Step 1
        SetTagValue "StepNumber", 1
        
        bUpdate = True
    End If
    
    ' Update PLC tags if changes were made
    If bUpdate Then WriteTags
    
EOF:
    Application.EnableEvents = True
    Exit Sub
    
ErrHandler:
    ResetWB
End Sub

'========================================================================
' Event: Worksheet_SelectionChange
' Triggered when: User changes cell selection
' Purpose:
'   1. Manages cell highlighting for active entry
'   2. Validates previous entries
'   3. Updates PLC step numbers based on selected column
'========================================================================
Private Sub Worksheet_SelectionChange(ByVal Target As Range)
    Dim loData As ListObject     ' Reference to main data table
    Dim bUpdate As Boolean       ' Flag to trigger PLC tag updates
    Dim rCell As Range          ' Used for cell iteration
    
    Application.EnableEvents = False
    
    Set loData = Me.ListObjects("tblData")
    
    '--------------------------------------------------------------------
    ' Cell Highlighting Management
    '--------------------------------------------------------------------
    Static rLastRng As Range    ' Keeps track of previously selected range
    On Error Resume Next
    
    ' Check if selection is in data range and is a single cell
    If Not Intersect(Target, loData.DataBodyRange) Is Nothing And _
            Target.Count = 1 And _
            Not Intersect(Target, Selection) Is Nothing _
            Then
        
        ' Highlight active cell
        Target.Style = "Input"
        
        ' Validate and highlight previous blank entries
        For Each rCell In loData.DataBodyRange
            If rCell.Address = Target.Address Then
                Exit For
            End If
            
            ' Mark empty required cells as bad
            If rCell.Value = "" And _
                    rCell.Row <> loData.ListRows.Count And _
                    Intersect(rCell, loData.ListColumns("Timestamp").DataBodyRange) Is Nothing Then
                    
                rCell.Style = "Bad"
                
            ElseIf rCell.Style <> "Input" Then
                rCell.Style = "Normal"
            End If
        Next rCell
    End If
    
    ' Reset previously selected cell formatting
    If rLastRng.Style = "Input" Then rLastRng.Style = "Normal"
    Set rLastRng = Target
    
    '--------------------------------------------------------------------
    ' PLC Step Number Updates
    '--------------------------------------------------------------------
    ' Update step number based on selected column
    
    ' Step 1: User Entry
    If Not Intersect(Selection, loData.ListColumns("User").DataBodyRange) Is Nothing Then
        SetTagValue "StepNumber", 1
        bUpdate = True
    End If
    
    ' Step 2: Job MO Entry
    If Not Intersect(Selection, loData.ListColumns("Job MO").DataBodyRange) Is Nothing Then
        SetTagValue "StepNumber", 2
        bUpdate = True
    End If
    
    ' Step 3: Cable Item Entry
    If Not Intersect(Selection, loData.ListColumns("Item").DataBodyRange) Is Nothing Then
        SetTagValue "StepNumber", 3
        bUpdate = True
    End If
    
    ' Step 4: Quantity Entry
    If Not Intersect(Selection, loData.ListColumns("Quantity (Feet)").DataBodyRange) Is Nothing Then
        SetTagValue "StepNumber", 4
        bUpdate = True
    End If
    
    ' Update PLC tags if step changed
    If bUpdate Then WriteTags
    
    Application.EnableEvents = True
    Exit Sub
    
ErrHandler:
    ResetWB
    Err.Raise Err.Number, Err.Source, Err.Description, Err.HelpFile, Err.HelpContext
End Sub

