/**
 *
 */
package ai.bell.shop.web.ctl;

import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.InetAddress;
import java.util.Calendar;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.Map;

import javax.imageio.ImageIO;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.github.wxpay.sdk.WXPay;
import com.github.wxpay.sdk.WXPayUtil;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import com.smthit.lang.data.ResponseData;

import ai.bell.shop.config.MyWXPayConfig;
import lombok.extern.slf4j.Slf4j;

/**
 * @author john
 *
 */
@Slf4j
@Controller
@RequestMapping("pay")
public class WXPayCtl {

	@Autowired
	private MyWXPayConfig wxPayConfig;

	@Autowired
	private WXPay wxpay;

	@PostMapping("prepareOrder")
	public String prepareOrder(HttpServletRequest servletRequest, Model model) {
		String view = "qrcode.html";

		servletRequest.getSession(true).removeAttribute("qrcode");

		// 创建订单
		Map<String, String> data = new HashMap<String, String>();
		data.put("body", "腾讯充值中心-QQ会员充值");
		data.put("out_trade_no", "2020090910595900000018");
		data.put("device_info", "WEB");
		data.put("fee_type", "CNY");
		data.put("total_fee", "102");
		// 此处指定为扫码支付
		data.put("trade_type", "NATIVE");
		// Native支付填调用微信支付API的机器IP
		try {
			InetAddress addr = InetAddress.getLocalHost();
			String ip = addr.getHostAddress().toString(); // 获取本机ip
			data.put("spbill_create_ip", ip);
		} catch (Exception e2) {
			log.error(e2.getMessage(), e2);
			data.put("spbill_create_ip", "127.0.0.1");
		}
		data.put("notify_url", wxPayConfig.getPayCallback());
		data.put("product_id", "667");


		try {
			Map<String, String> resp = wxpay.unifiedOrder(data);

			if (resp.get("return_code").equals("SUCCESS")) {
				servletRequest.getSession(true).setAttribute("code_url", resp.get("code_url"));
				model.addAttribute("r", Calendar.getInstance().getTimeInMillis());
				model.addAttribute("res", ResponseData.newSuccess("支付金额：0.01元"));
				return view;
			} else {
				model.addAttribute("res", ResponseData.newFailed(resp.get("return_msg")));
				return view;
			}
		} catch (Exception e3) {
			// 支付失败
			log.error(e3.getMessage(), e3);

			model.addAttribute("res", ResponseData.newFailed(e3.getMessage()));

			return view;
		}
	}

	@RequestMapping("qrcode")
	public void qrcode(HttpServletRequest request, HttpServletResponse response) {

		response.setContentType("image/jpeg");// 设置相应类型,告诉浏览器输出的内容为图片
		response.setHeader("Pragma", "No-cache");// 设置响应头信息，告诉浏览器不要缓存此内容
		response.setHeader("Cache-Control", "no-cache");
		response.setDateHeader("Expire", 0);

		try {
			String url = (String) request.getSession(true).getAttribute("code_url");
			ImageIO.write(genQRCode(url, 400), "png", response.getOutputStream());
			response.flushBuffer();
		} catch (Exception e) {
			log.error(e.getMessage(), e);
		}
	}

	private BufferedImage genQRCode(String text, int width) throws WriterException {
		final int BLACK = 0xFF000000;
		final int WHITE = 0xFFFFFFFF;

		Map<EncodeHintType, Object> hintMap = new EnumMap<EncodeHintType, Object>(EncodeHintType.class);
		hintMap.put(EncodeHintType.CHARACTER_SET, "UTF-8");

		// Now with zxing version 3.2.1 you could change border size (white border size to just 1)
		hintMap.put(EncodeHintType.MARGIN, 1); /* default = 4 */
		hintMap.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.L);

		QRCodeWriter qrCodeWriter = new QRCodeWriter();
		BitMatrix byteMatrix = qrCodeWriter.encode(text, BarcodeFormat.QR_CODE, width,
				width, hintMap);
		int CrunchifyWidth = byteMatrix.getWidth();
		BufferedImage image = new BufferedImage(CrunchifyWidth, CrunchifyWidth,
				BufferedImage.TYPE_INT_RGB);

		for (int i = 0; i < CrunchifyWidth; i++) {
			for (int j = 0; j < CrunchifyWidth; j++) {
				image.setRGB(i,  j, byteMatrix.get(i, j) ? BLACK : WHITE);
			}
		}

		return image;
	}

	@RequestMapping("/pay/wx_order_callback")
	@ResponseBody
	public String orderNotifyUrl(HttpServletRequest request) {
		try {
			InputStream inStream = request.getInputStream();

			int _buffer_size = 1024;
			if (inStream != null) {
				ByteArrayOutputStream outStream = new ByteArrayOutputStream();
				byte[] tempBytes = new byte[_buffer_size];
				int count = -1;
				while ((count = inStream.read(tempBytes, 0, _buffer_size)) != -1) {
					outStream.write(tempBytes, 0, count);
				}

				tempBytes = null;
				outStream.flush();

				// 将流转换成字符串
				String result = new String(outStream.toByteArray(), "UTF-8");
				Map<String, String> notifyMap = WXPayUtil.xmlToMap(result);  // 转换成map

				if (wxpay.isPayResultNotifySignatureValid(notifyMap)) {
					log.debug("付款回调成功");
					// 签名正确
					// 进行处理。
					// 注意特殊情况：订单已经退款，但收到了支付结果成功的通知，不应把商户侧订单状态从退款改成支付成功
				}
				else {
					log.debug("付款回调失败");
					// 签名错误，如果数据里没有sign字段，也认为是签名错误
				}
			}

			return "<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>";
		} catch (Exception exp) {
			log.error(exp.getMessage(), exp);
			return "<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[通知失败]]></return_msg></xml>";
		}
	}

	@RequestMapping("/pay/wx_refund_callback")
	@ResponseBody
	public String refundNotifyUrl(HttpServletRequest request) {
		try {
			InputStream inStream = request.getInputStream();

			int _buffer_size = 1024;
			if (inStream != null) {
				ByteArrayOutputStream outStream = new ByteArrayOutputStream();
				byte[] tempBytes = new byte[_buffer_size];
				int count = -1;
				while ((count = inStream.read(tempBytes, 0, _buffer_size)) != -1) {
					outStream.write(tempBytes, 0, count);
				}

				tempBytes = null;
				outStream.flush();

				// 将流转换成字符串
				String result = new String(outStream.toByteArray(), "UTF-8");
				Map<String, String> notifyMap = WXPayUtil.xmlToMap(result);  // 转换成map

				if (wxpay.isPayResultNotifySignatureValid(notifyMap)) {
					// 签名正确
					// 进行处理。
					// 注意特殊情况：订单已经退款，但收到了支付结果成功的通知，不应把商户侧订单状态从退款改成支付成功
				}
				else {
					// 签名错误，如果数据里没有sign字段，也认为是签名错误
				}
			}
			return "<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>";
		} catch (Exception exp) {
			log.error(exp.getMessage(), exp);
			return "<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[通知失败]]></return_msg></xml>";
		}
	}

}
