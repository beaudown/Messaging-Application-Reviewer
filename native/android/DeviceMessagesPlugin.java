package com.beaudown.messagingreviewer;

import android.Manifest;
import android.content.ContentResolver;
import android.database.Cursor;
import android.net.Uri;
import android.provider.Telephony;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@CapacitorPlugin(name = "DeviceMessages", permissions = {
    @Permission(alias = "sms", strings = {Manifest.permission.READ_SMS})
})
public class DeviceMessagesPlugin extends Plugin {
    @PluginMethod
    public void importSms(PluginCall call) {
        if (getPermissionState("sms") != com.getcapacitor.PermissionState.GRANTED) {
            requestPermissionForAlias("sms", call, "onSmsPermission");
            return;
        }
        readSms(call);
    }

    @PermissionCallback
    private void onSmsPermission(PluginCall call) {
        if (getPermissionState("sms") != com.getcapacitor.PermissionState.GRANTED) {
            call.reject("SMS permission denied. You can still import an exported XML backup.");
            return;
        }
        readSms(call);
    }

    private void readSms(PluginCall call) {
        final int limit = Math.max(1, Math.min(10000, call.getInt("limit", 5000)));
        final ContentResolver resolver = getContext().getContentResolver();
        final List<JSObject> items = new ArrayList<>();
        try (Cursor cursor = resolver.query(Telephony.Sms.CONTENT_URI,
            new String[] {Telephony.Sms._ID, Telephony.Sms.ADDRESS, Telephony.Sms.DATE,
                Telephony.Sms.BODY, Telephony.Sms.TYPE},
            null, null, Telephony.Sms.DATE + " DESC")) {
            if (cursor == null) { call.reject("SMS provider unavailable"); return; }
            while (cursor.moveToNext() && items.size() < limit) {
                JSObject row = new JSObject();
                row.put("sourceId", cursor.getString(0));
                row.put("sender", cursor.getInt(4) == Telephony.Sms.MESSAGE_TYPE_SENT ? "Me" :
                    (cursor.isNull(1) ? "Unknown" : cursor.getString(1)));
                row.put("time", new java.util.Date(cursor.getLong(2)).toInstant().toString());
                row.put("message", cursor.isNull(3) ? "" : cursor.getString(3));
                row.put("type", "sms");
                items.add(row);
            }
        } catch (SecurityException ex) {
            call.reject("Android denied SMS access", ex); return;
        } catch (Exception ex) {
            call.reject("Unable to read SMS provider", ex); return;
        }
        Collections.reverse(items);
        JSArray array = new JSArray();
        for (JSObject row : items) array.put(row);
        JSObject result = new JSObject();
        result.put("messages", array);
        result.put("count", items.size());
        result.put("scope", "sms-only");
        result.put("limited", items.size() >= limit);
        call.resolve(result);
    }
}
