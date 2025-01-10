VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "Sheet2"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = True
Attribute VB_Exposed = True
'========================================================================
' Module: RSLinx Worksheet
' Purpose: Handles PLC communication events including:
'          1. Monitoring PLC data updates
'          2. Updating quantity values based on PLC input
'          3. Managing RSLinx topic updates
'          4. Handling PLC tag writes
'========================================================================

'========================================================================
' Event: Worksheet_Calculate
' Triggered when: Worksheet recalculation occurs
' Purpose:
'   1. Monitors PLC completion requests
'   2. Updates quantity values based on PLC data
'========================================================================
Private Sub Worksheet_Calculate()
    ' Declare variables for PLC monitoring
    Dim loTbl As ListObject      ' Reference to PLC read table
    Dim bComplete As Boolean     ' Flag for PLC completion status
    
    ' Get reference to the PLC read table
    Set loTbl = Me.ListObjects("tblPLCRead")
    
    '--------------------------------------------------------------------
    ' Check PLC Completion Status
    '--------------------------------------------------------------------
    ' Safely check if PLC has requested completion
    On Error Resume Next
    bComplete = GetTagValue("CompleteReq")
    On Error GoTo 0
    
    ' Process completion request if:
    ' 1. PLC indicates completion
    ' 2. User is on Data worksheet
    ' 3. Selection is in the Quantity column
    If bComplete And ActiveSheet.Name = "Data" Then
        If Not Intersect(Selection, ThisWorkbook.Worksheets("Data").ListObjects("tblData").ListColumns("Quantity (Feet)").DataBodyRange) Is Nothing Then
            ' Update quantity with value from PLC
            Selection.Value = GetTagValue("Quantity")
        End If
    End If
End Sub

'========================================================================
' Event: Worksheet_Change
' Triggered when: Cell values change in the RSLinx worksheet
' Purpose:
'   1. Updates RSLinx topic configurations
'   2. Manages PLC tag write operations
'========================================================================
Private Sub Worksheet_Change(ByVal Target As Range)
    '--------------------------------------------------------------------
    ' RSLinx Topic Update Handler
    '--------------------------------------------------------------------
    ' Check if changes were made to topic name or PLC tag definitions
    If Not Intersect(Target, Me.Range("nrTopic")) Is Nothing Or _
            Not Intersect(Target, Me.ListObjects("tblPLCRead").ListColumns("PLCTag").DataBodyRange) Is Nothing Then
        ' Update RSLinx read tag configurations
        UpdateReadTags
    End If
    
    '--------------------------------------------------------------------
    ' PLC Write Handler
    '--------------------------------------------------------------------
    ' Check if changes were made to PLC write values
    If Not Intersect(Target, Me.ListObjects("tblPLCWrite").ListColumns("Value").DataBodyRange) Is Nothing Then
        ' Write updated values to PLC
        WriteTags
    End If
End Sub

